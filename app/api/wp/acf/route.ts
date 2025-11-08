import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { WordPressAPI } from '@/app/lib/wp-api';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);

    const { searchParams } = new URL(request.url);
    const postType = searchParams.get('post_type');
    const fieldName = searchParams.get('field_name');

    if (!postType || !fieldName) {
      return NextResponse.json(
        { error: 'post_type and field_name are required' },
        { status: 400 }
      );
    }

    // Try to fetch ACF field choices from custom endpoint
    try {
      const baseUrl = process.env.WORDPRESS_API_URL?.replace('/wp/v2', '') || 'https://staging.neck-tontechnik.com/wp-json';
      const acfResponse = await fetch(
        `${baseUrl}/neck-tontechnik/v1/acf/field-choices?post_type=${postType}&field_name=${fieldName}`,
        {
          headers: {
            'Authorization': `Basic ${session.token}`,
          },
        }
      );

      if (acfResponse.ok) {
        const acfData = await acfResponse.json();
        // Custom endpoint returns choices in format: [{ value: string, label: string }]
        if (acfData.choices && Array.isArray(acfData.choices)) {
          return NextResponse.json({ choices: acfData.choices });
        }
      }
    } catch (acfError) {
      console.log('ACF field choices endpoint not available:', acfError);
    }

    // Fallback: Return empty choices - the frontend will handle it as a text field
    return NextResponse.json({ choices: [] });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching ACF field:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ACF field' },
      { status: 500 }
    );
  }
}

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

