import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const TESTIMONIALS_FILE = join(process.cwd(), 'data', 'testimonials.json');

export async function GET() {
  try {
    const fileContent = await readFile(TESTIMONIALS_FILE, 'utf-8');
    const testimonials = JSON.parse(fileContent);
    return NextResponse.json(testimonials);
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
    await requireAuth();
    const body = await request.json();
    
    // Ensure data directory exists
    const dataDir = dirname(TESTIMONIALS_FILE);
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    
    // Read existing testimonials or initialize empty array
    let testimonials: any[] = [];
    try {
      const fileContent = await readFile(TESTIMONIALS_FILE, 'utf-8');
      testimonials = JSON.parse(fileContent);
    } catch (error: any) {
      // File doesn't exist yet, start with empty array
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    
    // Add new testimonial
    const newTestimonial = {
      id: testimonials.length > 0 ? Math.max(...testimonials.map((t: any) => t.id || 0), 0) + 1 : 1,
      ...body,
    };
    
    testimonials.push(newTestimonial);
    
    // Write back to file
    try {
      await writeFile(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), 'utf-8');
    } catch (writeError: any) {
      // On Vercel, file system is read-only, so we can't write files
      // This is expected in production - you'll need to use a database or external storage
      console.error('Cannot write to file system (read-only in production):', writeError);
      return NextResponse.json(
        { error: 'File system is read-only in production. Please use a database or external storage.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newTestimonial);
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
    await requireAuth();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // Read existing testimonials
    let testimonials: any[] = [];
    try {
      const fileContent = await readFile(TESTIMONIALS_FILE, 'utf-8');
      testimonials = JSON.parse(fileContent);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json(
          { error: 'Testimonials file not found' },
          { status: 404 }
        );
      }
      throw error;
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
    try {
      await writeFile(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), 'utf-8');
    } catch (writeError: any) {
      // On Vercel, file system is read-only
      console.error('Cannot write to file system (read-only in production):', writeError);
      return NextResponse.json(
        { error: 'File system is read-only in production. Please use a database or external storage.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(testimonials[index]);
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
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // Read existing testimonials
    let testimonials: any[] = [];
    try {
      const fileContent = await readFile(TESTIMONIALS_FILE, 'utf-8');
      testimonials = JSON.parse(fileContent);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json(
          { error: 'Testimonials file not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    // Filter out the testimonial
    const filtered = testimonials.filter((t: any) => t.id !== id);
    
    // Write back to file
    try {
      await writeFile(TESTIMONIALS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    } catch (writeError: any) {
      // On Vercel, file system is read-only
      console.error('Cannot write to file system (read-only in production):', writeError);
      return NextResponse.json(
        { error: 'File system is read-only in production. Please use a database or external storage.' },
        { status: 500 }
      );
    }
    
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

