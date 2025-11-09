import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { WordPressAPI } from '@/app/lib/wp-api';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);

    const { searchParams } = new URL(request.url);
    const params: Record<string, any> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const posts = await wpApi.getPosts('gear', params);
    return NextResponse.json(posts);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);

    const body = await request.json();
    
    // Separate meta from post data
    const { meta, ...postData } = body;
    
    // Create the post with title, status, featured_media
    const createPayload: Record<string, any> = {};
    if (postData.title !== undefined) {
      createPayload.title = postData.title;
    }
    if (postData.status !== undefined) {
      createPayload.status = postData.status;
    }
    if (postData.featured_media !== undefined) {
      createPayload.featured_media = postData.featured_media;
    }
    
    // Create the post first
    let post = await wpApi.createPost('gear', createPayload);
    
    // Then update meta fields if provided
    if (meta && Object.keys(meta).length > 0) {
      try {
        post = await wpApi.updateEquipmentMeta(post.id, meta);
      } catch (metaError: any) {
        console.error('Error updating equipment meta on create:', metaError?.response?.data || metaError?.message);
        // Try fallback: update via post meta
        post = await wpApi.updatePost('gear', post.id, { meta });
      }
    }
    
    return NextResponse.json(post);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating equipment:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: 'Failed to create equipment',
        details: error.response?.data || error.message,
        status: error.response?.status,
      },
      { status: 500 }
    );
  }
}

