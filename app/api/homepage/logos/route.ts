import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { WordPressAPI } from '@/app/lib/wp-api';
import { readFile } from 'fs/promises';
import { join } from 'path';

const LOGOS_FILE = join(process.cwd(), 'data', 'homepage-logos.json');

// Default logos
const defaultLogos = [
  { src: "/images/home/references-carousel/102boyz-1.png", alt: "102 Boyz" },
  { src: "/images/home/references-carousel/Korn_Logo_grey.png", alt: "Korn" },
  { src: "/images/home/references-carousel/SKIAGGU_SHADOW.png", alt: "Skiaggu" },
  { src: "/images/home/references-carousel/red-bull-symphonic-gold (1).png", alt: "Red Bull Symphonic" }
];

async function getLogos() {
  try {
    const fileContent = await readFile(LOGOS_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // File doesn't exist, return default
    return defaultLogos;
  }
}

export async function GET() {
  try {
    // Try WordPress first (production)
    try {
      const wpApi = new WordPressAPI();
      const logos = await wpApi.getOptionViaMeta('homepage_logos');
      if (logos && Array.isArray(logos) && logos.length > 0) {
        return NextResponse.json(logos);
      }
    } catch (wpError: any) {
      // Fallback to file system for local development
      console.log('WordPress not available, using file system fallback');
    }
    
    // Fallback to file system
    const logos = await getLogos();
    return NextResponse.json(logos);
  } catch (error) {
    console.error('Error reading logos:', error);
    return NextResponse.json(defaultLogos);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);
    const body = await request.json();
    
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Logos must be an array' },
        { status: 400 }
      );
    }
    
    // Store in WordPress
    await wpApi.setOptionViaMeta('homepage_logos', body);
    
    return NextResponse.json(body);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating logos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update logos' },
      { status: 500 }
    );
  }
}

