import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { WordPressAPI } from '@/app/lib/wp-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);
    
    const { slug } = await params;
    
    // Fetch page by slug - WordPress REST API uses 'pages' (plural) endpoint
    let pages;
    try {
      pages = await wpApi.getPosts('pages', { slug });
    } catch (wpError: any) {
      console.error('WordPress API error:', wpError);
      // Check if it's a 404 or route not found error
      if (wpError.response?.status === 404 || 
          (wpError.response?.data?.message && wpError.response.data.message.includes('No route'))) {
        // Try with 'page' (singular) as fallback
        try {
          pages = await wpApi.getPosts('page', { slug });
        } catch (fallbackError: any) {
          console.error('Fallback WordPress API error:', fallbackError);
          throw wpError; // Throw original error
        }
      } else {
        throw wpError;
      }
    }
    
    // Handle case where getPosts returns an error object
    if (pages && typeof pages === 'object' && 'code' in pages) {
      const errorMessage = (pages as any).message || 'WordPress API error';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
    
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(pages[0]);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching page:', error);
    
    // Provide more detailed error message
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch page from WordPress';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);
    
    const { slug } = await params;
    const body = await request.json();
    
    // Prepare create payload
    const createPayload: Record<string, any> = {
      slug,
      status: body.status || 'publish',
    };
    
    if (body.title !== undefined) {
      createPayload.title = body.title;
    }
    
    if (body.content !== undefined) {
      createPayload.content = body.content;
    }
    
    // WordPress REST API uses 'pages' (plural) for creating pages
    let newPage;
    try {
      newPage = await wpApi.createPost('pages', createPayload);
    } catch (error: any) {
      // Fallback to 'page' (singular) if 'pages' doesn't work
      if (error.response?.status === 404 || 
          (error.response?.data?.message && error.response.data.message.includes('No route'))) {
        newPage = await wpApi.createPost('page', createPayload);
      } else {
        throw error;
      }
    }
    
    return NextResponse.json(newPage);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create page' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);
    
    const { slug } = await params;
    const body = await request.json();
    
    // First, get the page to find its ID - WordPress REST API uses 'pages' (plural)
    let pages;
    try {
      pages = await wpApi.getPosts('pages', { slug });
    } catch (error: any) {
      // Fallback to 'page' (singular) if 'pages' doesn't work
      if (error.response?.status === 404 || 
          (error.response?.data?.message && error.response.data.message.includes('No route'))) {
        pages = await wpApi.getPosts('page', { slug });
      } else {
        throw error;
      }
    }
    
    let pageId: number;
    
    // If page doesn't exist, create it
    if (!pages || pages.length === 0) {
      const createPayload: Record<string, any> = {
        slug,
        status: body.status || 'publish',
      };
      
      if (body.title !== undefined) {
        createPayload.title = body.title;
      }
      
      if (body.content !== undefined) {
        createPayload.content = body.content;
      }
      
      // WordPress REST API uses 'pages' (plural) for creating pages
      let newPage;
      try {
        newPage = await wpApi.createPost('pages', createPayload);
      } catch (error: any) {
        // Fallback to 'page' (singular) if 'pages' doesn't work
        if (error.response?.status === 404 || 
            (error.response?.data?.message && error.response.data.message.includes('No route'))) {
          newPage = await wpApi.createPost('page', createPayload);
        } else {
          throw error;
        }
      }
      pageId = newPage.id;
    } else {
      pageId = pages[0].id;
    }
    
    // Prepare update payload
    const updatePayload: Record<string, any> = {};
    
    if (body.title !== undefined) {
      updatePayload.title = body.title;
    }
    
    if (body.content !== undefined) {
      updatePayload.content = body.content;
    }
    
    if (body.status !== undefined) {
      updatePayload.status = body.status;
    }
    
    // WordPress REST API uses 'pages' (plural) for updating pages
    let updatedPage;
    try {
      updatedPage = await wpApi.updatePost('pages', pageId, updatePayload);
    } catch (error: any) {
      // Fallback to 'page' (singular) if 'pages' doesn't work
      if (error.response?.status === 404 || 
          (error.response?.data?.message && error.response.data.message.includes('No route'))) {
        updatedPage = await wpApi.updatePost('page', pageId, updatePayload);
      } else {
        throw error;
      }
    }
    
    return NextResponse.json(updatedPage);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update page' },
      { status: 500 }
    );
  }
}

