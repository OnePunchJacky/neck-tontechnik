import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { WordPressAPI } from '@/app/lib/wp-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);
    const { id } = await params;

    const post = await wpApi.getPost('gear', parseInt(id));
    return NextResponse.json(post);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);
    const { id } = await params;
    const body = await request.json();

    // Separate meta fields from regular post data
    const { meta, ...postData } = body;
    
    // Ensure title is included in postData if provided
    // WordPress REST API should accept title even if post type doesn't explicitly support it
    const updatePayload: Record<string, any> = {};
    if (postData.title !== undefined) {
      updatePayload.title = postData.title;
    }
    if (postData.status !== undefined) {
      updatePayload.status = postData.status;
    }
    if (postData.featured_media !== undefined) {
      updatePayload.featured_media = postData.featured_media;
    }
    
    // Update the post first (with title, status, featured_media)
    let updatedPost;
    if (Object.keys(updatePayload).length > 0) {
      updatedPost = await wpApi.updatePost('gear', parseInt(id), updatePayload);
    } else {
      updatedPost = await wpApi.getPost('gear', parseInt(id));
    }
    
    // Handle meta fields separately for equipment (these are custom meta, not ACF)
    if (meta && Object.keys(meta).length > 0) {
      console.log('Updating equipment meta fields:', meta);
      try {
        updatedPost = await wpApi.updateEquipmentMeta(parseInt(id), meta);
        console.log('Equipment meta fields updated successfully');
      } catch (metaError: any) {
        console.error('Error updating equipment meta:', metaError?.response?.data || metaError?.message);
        // Try fallback: update via post meta
        updatedPost = await wpApi.updatePost('gear', parseInt(id), { meta });
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating equipment:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return NextResponse.json(
      { 
        error: 'Failed to update equipment',
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    await wpApi.deletePost('gear', parseInt(id), force);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting equipment:', error);
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}

