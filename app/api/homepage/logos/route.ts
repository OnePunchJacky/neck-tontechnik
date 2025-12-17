import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { WordPressAPI } from '@/app/lib/wp-api';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

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
      
      // Return WordPress logos if they exist (even if empty array)
      if (logos !== null && logos !== undefined) {
        if (Array.isArray(logos)) {
          return NextResponse.json(logos);
        }
      }
    } catch (wpError: any) {
      // Fallback to file system for local development
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
    
    // Revalidate homepage to clear cache
    revalidatePath('/');
    
    return NextResponse.json(body);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating logos:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: error.message || 'Failed to update logos',
        details: error.response?.data || error.message,
        status: error.response?.status,
      },
      { status: 500 }
    );
  }
}

