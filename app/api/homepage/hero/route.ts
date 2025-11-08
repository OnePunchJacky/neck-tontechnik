import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const HOMEPAGE_CONFIG_FILE = join(process.cwd(), 'data', 'homepage-config.json');

// Default hero configuration
const defaultHeroConfig = {
  images: [
    {
      src: "/images/home/home-hero-1.jpg",
      alt: "Professional audio engineering setup",
      title: "Klang auf den Punkt – Live und im Studio",
      description: "Professionelle Tontechnik-Lösungen für Veranstaltungen und Studios"
    },
    {
      src: "/images/home/home-hero-2.jpg",
      alt: "2 Sound Engineers photgraphed from the side looking at a mixing desk",
      title: "Tontechnik",
      description: "Professionelle Tontechnik-Lösungen für Veranstaltungen und Studios"
    },
    {
      src: "/images/home/home-hero-3.jpg",
      alt: "2 Sound Engineers photgraphed from above looking at a mixing desk",
      title: "Live-Tontechnik",
      description: "Professionelle Beschallung für Ihre Veranstaltung"
    },
  ],
  quoteText: "Egal ob fette Liveshows, präzise Studioarbeit oder praxisnahe Workshops – ich bringe Sound auf die nächste Stufe. Mit jahrelanger Erfahrung als Live- und Studiotechniker sorge ich dafür, dass deine Musik genau so klingt, wie sie klingen soll.",
};

async function getConfig() {
  try {
    const fileContent = await readFile(HOMEPAGE_CONFIG_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // File doesn't exist, return default
    return defaultHeroConfig;
  }
}

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading homepage config:', error);
    return NextResponse.json(defaultHeroConfig);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    
    // Merge with existing config
    const existingConfig = await getConfig();
    const updatedConfig = { ...existingConfig, ...body };
    
    // Write to file
    await writeFile(HOMEPAGE_CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf-8');
    
    return NextResponse.json(updatedConfig);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating homepage config:', error);
    return NextResponse.json(
      { error: 'Failed to update homepage config' },
      { status: 500 }
    );
  }
}

