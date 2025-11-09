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

    // WordPress REST API includes meta fields by default if custom-fields support is enabled
    // The post type has 'custom-fields' in supports, so meta should be included
    const posts = await wpApi.getPosts('live_reference', params);
    return NextResponse.json(posts);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching live references:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live references' },
      { status: 500 }
    );
  }
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  // Use a simple approach: replace common HTML entities
  return text
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);

    const body = await request.json();
    
    // Decode HTML entities in title to prevent double-encoding
    if (body.title && typeof body.title === 'string') {
      body.title = decodeHtmlEntities(body.title);
    }
    
    const post = await wpApi.createPost('live_reference', body);
    return NextResponse.json(post);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating live reference:', error);
    return NextResponse.json(
      { error: 'Failed to create live reference' },
      { status: 500 }
    );
  }
}

