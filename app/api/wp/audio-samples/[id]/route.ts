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

    const post = await wpApi.getPost('audio_sample', parseInt(id));
    return NextResponse.json(post);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching audio sample:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audio sample' },
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

    const post = await wpApi.updatePost('audio_sample', parseInt(id), body);
    return NextResponse.json(post);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating audio sample:', error);
    return NextResponse.json(
      { error: 'Failed to update audio sample' },
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

    await wpApi.deletePost('audio_sample', parseInt(id), force);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting audio sample:', error);
    return NextResponse.json(
      { error: 'Failed to delete audio sample' },
      { status: 500 }
    );
  }
}

