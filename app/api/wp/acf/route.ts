import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { WordPressAPI } from '@/app/lib/wp-api';

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);

    const body = await request.json();
    const { post_type, post_id, fields } = body;

    if (!post_type || !post_id || !fields) {
      return NextResponse.json(
        { error: 'post_type, post_id, and fields are required' },
        { status: 400 }
      );
    }

    // ACF fields are typically updated via meta or ACF REST API
    // This is a simplified version - actual implementation depends on ACF configuration
    const result = await wpApi.updateACFFields(post_type, post_id, fields);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating ACF fields:', error);
    return NextResponse.json(
      { error: 'Failed to update ACF fields' },
      { status: 500 }
    );
  }
}

