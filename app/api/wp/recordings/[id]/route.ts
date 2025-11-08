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

    const post = await wpApi.getPost('recording', parseInt(id));
    return NextResponse.json(post);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching recording:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recording' },
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
      console.log('Updating recording with ACF fields:', acf);
    }
    
    let updatedPost = await wpApi.updatePost('recording', parseInt(id), updatePayload);
    
    // If ACF fields weren't updated via the main update, try alternative methods
    if (acf && Object.keys(acf).length > 0) {
      // Verify if ACF fields were saved by checking the response
      // If not, try ACF REST API as fallback
      try {
        const verifyPost = await wpApi.getPost('recording', parseInt(id));
        const needsACFUpdate = !verifyPost.acf || 
          Object.keys(acf).some(key => {
            const sentValue = acf[key];
            const savedValue = verifyPost.acf?.[key];
            // Compare values (handle number/string conversions)
            if (typeof sentValue === 'number' && typeof savedValue === 'string') {
              return String(sentValue) !== savedValue;
            }
            return sentValue !== savedValue;
          });
        
        if (needsACFUpdate) {
          console.log('ACF fields not updated via main update, trying ACF REST API...');
          try {
            await wpApi.updateACFViaREST(parseInt(id), acf);
            console.log('ACF REST API update successful');
            // Refresh the post after ACF update
            updatedPost = await wpApi.getPost('recording', parseInt(id));
          } catch (acfError: any) {
            console.log('ACF REST API also failed, trying meta fallback. Error:', acfError?.response?.data || acfError?.message);
            // Last resort: try meta with acf_ prefix
            const metaPayload: Record<string, any> = {};
            Object.keys(acf).forEach(key => {
              metaPayload[`acf_${key}`] = acf[key];
            });
            updatedPost = await wpApi.updatePost('recording', parseInt(id), { meta: metaPayload });
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
    console.error('Error updating recording:', error);
    return NextResponse.json(
      { error: 'Failed to update recording' },
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

    await wpApi.deletePost('recording', parseInt(id), force);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting recording:', error);
    return NextResponse.json(
      { error: 'Failed to delete recording' },
      { status: 500 }
    );
  }
}

