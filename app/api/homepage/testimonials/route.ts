import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const TESTIMONIALS_FILE = join(process.cwd(), 'data', 'testimonials.json');

export async function GET() {
  try {
    const fileContent = await readFile(TESTIMONIALS_FILE, 'utf-8');
    const testimonials = JSON.parse(fileContent);
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error reading testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to read testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    
    // Read existing testimonials
    const fileContent = await readFile(TESTIMONIALS_FILE, 'utf-8');
    const testimonials = JSON.parse(fileContent);
    
    // Add new testimonial
    const newTestimonial = {
      id: Math.max(...testimonials.map((t: any) => t.id || 0), 0) + 1,
      ...body,
    };
    
    testimonials.push(newTestimonial);
    
    // Write back to file
    await writeFile(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), 'utf-8');
    
    return NextResponse.json(newTestimonial);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // Read existing testimonials
    const fileContent = await readFile(TESTIMONIALS_FILE, 'utf-8');
    const testimonials = JSON.parse(fileContent);
    
    // Find and update testimonial
    const index = testimonials.findIndex((t: any) => t.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }
    
    testimonials[index] = { ...testimonials[index], ...updateData };
    
    // Write back to file
    await writeFile(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), 'utf-8');
    
    return NextResponse.json(testimonials[index]);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // Read existing testimonials
    const fileContent = await readFile(TESTIMONIALS_FILE, 'utf-8');
    const testimonials = JSON.parse(fileContent);
    
    // Filter out the testimonial
    const filtered = testimonials.filter((t: any) => t.id !== id);
    
    // Write back to file
    await writeFile(TESTIMONIALS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}

