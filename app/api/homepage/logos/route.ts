import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';
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
    const logos = await getLogos();
    return NextResponse.json(logos);
  } catch (error) {
    console.error('Error reading logos:', error);
    return NextResponse.json(defaultLogos);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Logos must be an array' },
        { status: 400 }
      );
    }
    
    // Write to file
    try {
      await writeFile(LOGOS_FILE, JSON.stringify(body, null, 2), 'utf-8');
    } catch (writeError: any) {
      // On Vercel, file system is read-only
      console.error('Cannot write to file system (read-only in production):', writeError);
      return NextResponse.json(
        { error: 'File system is read-only in production. Please use a database or external storage.' },
        { status: 500 }
      );
    }
    
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

