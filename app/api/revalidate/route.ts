import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const path = searchParams.get('path');
  const tag = searchParams.get('tag');

  // Verify secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }

  try {
    // Revalidate by path if provided
    if (path) {
      revalidatePath(path);
      return NextResponse.json({ 
        revalidated: true, 
        path,
        now: Date.now() 
      });
    }

    // Revalidate by tag if provided
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ 
        revalidated: true, 
        tag,
        now: Date.now() 
      });
    }

    // If no path or tag specified, revalidate common pages
    const commonPaths = [
      '/agb',
      '/impressum',
      '/datenschutz',
      '/ueber-mich',
      '/referenzen/live',
      '/referenzen/recordings',
      '/referenzen/mastering',
      '/equipment-verleih',
      '/',
    ];

    commonPaths.forEach(p => revalidatePath(p));

    return NextResponse.json({ 
      revalidated: true, 
      paths: commonPaths,
      now: Date.now() 
    });
  } catch (err) {
    console.error('Error revalidating:', err);
    return NextResponse.json(
      { message: 'Error revalidating', error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, path, paths, tag, postType, postId } = body;

    // Verify secret
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Revalidate by path(s)
    if (path) {
      revalidatePath(path);
      return NextResponse.json({ 
        revalidated: true, 
        path,
        now: Date.now() 
      });
    }

    if (paths && Array.isArray(paths)) {
      paths.forEach(p => revalidatePath(p));
      return NextResponse.json({ 
        revalidated: true, 
        paths,
        now: Date.now() 
      });
    }

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ 
        revalidated: true, 
        tag,
        now: Date.now() 
      });
    }

    // Revalidate based on post type
    if (postType) {
      const pathMap: Record<string, string[]> = {
        'page': ['/agb', '/impressum', '/datenschutz', '/ueber-mich'],
        'live_reference': ['/referenzen/live'],
        'recording': ['/referenzen/recordings'],
        'audio_sample': ['/referenzen/mastering'],
        'gear': ['/equipment-verleih'],
        'artist': ['/referenzen/recordings', '/referenzen/mastering'],
        'testimonial': ['/'],
      };

      const pathsToRevalidate = pathMap[postType] || [];
      pathsToRevalidate.forEach(p => revalidatePath(p));
      
      // Also revalidate homepage for most content types
      if (postType !== 'page') {
        revalidatePath('/');
      }

      return NextResponse.json({ 
        revalidated: true, 
        postType,
        paths: pathsToRevalidate,
        now: Date.now() 
      });
    }

    return NextResponse.json(
      { message: 'No path, paths, tag, or postType provided' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Error revalidating:', err);
    return NextResponse.json(
      { message: 'Error revalidating', error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

