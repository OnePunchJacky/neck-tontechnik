import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { WordPressAPI } from '@/app/lib/wp-api';

// Fallback to file system for local development
import { readFile } from 'fs/promises';
import { join } from 'path';

const TESTIMONIALS_FILE = join(process.cwd(), 'data', 'testimonials.json');

export async function GET() {
  try {
    // Try WordPress first (production)
    try {
      const wpApi = new WordPressAPI();
      const testimonials = await wpApi.getPosts('testimonial', { per_page: 100, status: 'publish' });
      
      // Transform WordPress posts to testimonial format
      const transformed = testimonials.map((post: any) => ({
        id: post.id,
        text: post.acf?.text || post.content?.rendered || '',
        author: post.acf?.author || post.title?.rendered || '',
        role: post.acf?.role || '',
        company: post.acf?.company || '',
      }));
      
      return NextResponse.json(transformed);
    } catch (wpError: any) {
      // If post type doesn't exist (404) or other WordPress error, fallback to file system
      if (wpError.response?.status === 404 || wpError.code === 'ENOTFOUND') {
        console.log('WordPress testimonial post type not available, using file system fallback');
      } else {
        console.log('WordPress error, using file system fallback:', wpError.message);
      }
      
      // Fallback to file system for local development
      try {
        const fileContent = await readFile(TESTIMONIALS_FILE, 'utf-8');
        const testimonials = JSON.parse(fileContent);
        return NextResponse.json(testimonials);
      } catch (fileError) {
        // Return empty array if file doesn't exist
        return NextResponse.json([]);
      }
    }
  } catch (error) {
    console.error('Error reading testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to read testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);
    const body = await request.json();
    
    // Create testimonial as WordPress post
    const postData: any = {
      title: body.author || 'Testimonial',
      content: body.text || '',
      status: 'publish',
    };
    
    // Add ACF fields
    const acfFields: any = {
      text: body.text || '',
      author: body.author || '',
      role: body.role || '',
      company: body.company || '',
    };
    
    // Create the post
    const newPost = await wpApi.createPost('testimonial', postData);
    
    // Update ACF fields
    try {
      await wpApi.updateACFViaREST(newPost.id, acfFields);
    } catch (acfError: any) {
      // Fallback: update via meta
      console.log('ACF REST API not available, using meta fallback');
      const metaPayload: Record<string, any> = {};
      Object.keys(acfFields).forEach(key => {
        metaPayload[`acf_${key}`] = acfFields[key];
      });
      await wpApi.updatePost('testimonial', newPost.id, { meta: metaPayload });
    }
    
    // Return in the expected format
    const testimonial = {
      id: newPost.id,
      text: acfFields.text,
      author: acfFields.author,
      role: acfFields.role,
      company: acfFields.company,
    };
    
    return NextResponse.json(testimonial);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // Try WordPress first
    try {
      const wpApi = new WordPressAPI(session.token);
      
      // Update WordPress post
      const postData: any = {
        title: updateData.author || 'Testimonial',
        content: updateData.text || '',
      };
      
      await wpApi.updatePost('testimonial', parseInt(String(id)), postData);
      
      // Update ACF fields
      const acfFields: any = {};
      if (updateData.text !== undefined) acfFields.text = updateData.text;
      if (updateData.author !== undefined) acfFields.author = updateData.author;
      if (updateData.role !== undefined) acfFields.role = updateData.role;
      if (updateData.company !== undefined) acfFields.company = updateData.company;
      
      if (Object.keys(acfFields).length > 0) {
        try {
          await wpApi.updateACFViaREST(parseInt(String(id)), acfFields);
        } catch (acfError: any) {
          // Fallback: update via meta
          console.log('ACF REST API not available, using meta fallback');
          const metaPayload: Record<string, any> = {};
          Object.keys(acfFields).forEach(key => {
            metaPayload[`acf_${key}`] = acfFields[key];
          });
          await wpApi.updatePost('testimonial', parseInt(String(id)), { meta: metaPayload });
        }
      }
      
      // Get updated post
      const updatedPost = await wpApi.getPost('testimonial', parseInt(String(id)));
      
      // Return in expected format
      const testimonial = {
        id: updatedPost.id,
        text: updatedPost.acf?.text || updateData.text || '',
        author: updatedPost.acf?.author || updateData.author || '',
        role: updatedPost.acf?.role || updateData.role || '',
        company: updatedPost.acf?.company || updateData.company || '',
      };
      
      return NextResponse.json(testimonial);
    } catch (wpError: any) {
      // Log the error for debugging
      console.error('WordPress error when updating testimonial:', {
        status: wpError.response?.status,
        statusText: wpError.response?.statusText,
        data: wpError.response?.data,
        message: wpError.message,
        code: wpError.code,
      });
      
      // If WordPress fails (e.g., post type doesn't exist), fallback to file system
      const is404 = wpError.response?.status === 404 || 
                    wpError.code === 'ENOTFOUND' || 
                    wpError.message?.includes('404') ||
                    wpError.response?.data?.code === 'rest_no_route';
      
      if (is404) {
        console.log('WordPress testimonial post type not available (404), using file system fallback');
        
        // Fallback to file system
        const { writeFile, mkdir } = await import('fs/promises');
        const { existsSync } = await import('fs');
        const { dirname } = await import('path');
        
        // Ensure data directory exists
        const dataDir = dirname(TESTIMONIALS_FILE);
        if (!existsSync(dataDir)) {
          await mkdir(dataDir, { recursive: true });
        }
        
        // Read existing testimonials
        let testimonials: any[] = [];
        try {
          const fileContent = await readFile(TESTIMONIALS_FILE, 'utf-8');
          testimonials = JSON.parse(fileContent);
        } catch (fileError: any) {
          if (fileError.code !== 'ENOENT') {
            throw fileError;
          }
        }
        
        // Find and update testimonial
        const index = testimonials.findIndex((t: any) => t.id === id);
        if (index === -1) {
          return NextResponse.json(
            { error: 'Testimonial not found' },
            { status: 404 }
          );
        }
        
        testimonials[index] = { ...testimonials[index], ...updateData };
        
        // Write back to file
        await writeFile(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), 'utf-8');
        
        return NextResponse.json(testimonials[index]);
      }
      
      // Re-throw other WordPress errors
      throw wpError;
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // Delete WordPress post
    await wpApi.deletePost('testimonial', id, true);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}

