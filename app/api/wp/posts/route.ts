import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { WordPressAPI } from '@/app/lib/wp-api';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);

    const { searchParams } = new URL(request.url);
    const postType = searchParams.get('post_type') || 'post';
    const params: Record<string, any> = {};

    // Forward query parameters
    searchParams.forEach((value, key) => {
      if (key !== 'post_type') {
        params[key] = value;
      }
    });

    const posts = await wpApi.getPosts(postType, params);
    return NextResponse.json(posts);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);

    const body = await request.json();
    const { post_type, ...postData } = body;

    if (!post_type) {
      return NextResponse.json(
        { error: 'post_type is required' },
        { status: 400 }
      );
    }

    const post = await wpApi.createPost(post_type, postData);
    return NextResponse.json(post);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

