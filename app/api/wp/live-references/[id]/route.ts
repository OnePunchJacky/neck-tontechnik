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

    const post = await wpApi.getPost('live_reference', parseInt(id));
    return NextResponse.json(post);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching live reference:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live reference' },
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

    // Separate ACF fields from regular post data
    const { acf, ...postData } = body;
    
    // Update the post with all data including ACF fields
    // ACF fields should be sent directly in the 'acf' object
    const updatePayload = { ...postData };
    if (acf && Object.keys(acf).length > 0) {
      updatePayload.acf = acf;
      console.log('Updating live reference with ACF fields:', acf);
    }
    
    let updatedPost = await wpApi.updatePost('live_reference', parseInt(id), updatePayload);
    
    // If ACF fields weren't updated via the main update, try ACF REST API
    if (acf && Object.keys(acf).length > 0) {
      try {
        const verifyPost = await wpApi.getPost('live_reference', parseInt(id));
        const needsACFUpdate = !verifyPost.acf || 
          Object.keys(acf).some(key => {
            const sentValue = acf[key];
            const savedValue = verifyPost.acf?.[key];
            
            // Handle null/undefined comparisons
            if (sentValue === null || sentValue === undefined) {
              return savedValue !== null && savedValue !== undefined && savedValue !== '';
            }
            if (savedValue === null || savedValue === undefined) {
              return sentValue !== null && sentValue !== undefined && sentValue !== '';
            }
            
            // Handle number/string conversions (for media IDs like bild)
            if (typeof sentValue === 'number' && typeof savedValue === 'string') {
              return String(sentValue) !== savedValue && String(sentValue) !== String(parseInt(savedValue));
            }
            if (typeof sentValue === 'string' && typeof savedValue === 'number') {
              return sentValue !== String(savedValue) && parseInt(sentValue) !== savedValue;
            }
            
            return sentValue !== savedValue;
          });
        
        if (needsACFUpdate) {
          console.log('ACF fields not updated via main update, trying ACF REST API...');
          try {
            await wpApi.updateACFViaREST(parseInt(id), acf);
            console.log('ACF REST API update successful');
            updatedPost = await wpApi.getPost('live_reference', parseInt(id));
          } catch (acfError: any) {
            console.log('ACF REST API also failed, trying meta fallback. Error:', acfError?.response?.data || acfError?.message);
            // Last resort: try meta with acf_ prefix (same as recordings)
            const metaPayload: Record<string, any> = {};
            Object.keys(acf).forEach(key => {
              metaPayload[`acf_${key}`] = acf[key];
            });
            updatedPost = await wpApi.updatePost('live_reference', parseInt(id), { meta: metaPayload });
            console.log('Meta fallback update completed');
          }
        } else {
          console.log('ACF fields successfully updated via main update');
        }
      } catch (verifyError) {
        console.error('Error verifying ACF update:', verifyError);
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Log detailed error information
    console.error('Error updating live reference:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      stack: error.stack,
    });
    
    // Return more detailed error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error?.message ||
                        error.message || 
                        'Failed to update live reference';
    
    return NextResponse.json(
      { error: errorMessage, details: error.response?.data },
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

    await wpApi.deletePost('live_reference', parseInt(id), force);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting live reference:', error);
    return NextResponse.json(
      { error: 'Failed to delete live reference' },
      { status: 500 }
    );
  }
}

