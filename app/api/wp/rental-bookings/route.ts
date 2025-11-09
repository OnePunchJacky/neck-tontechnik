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

    const bookings = await wpApi.getRentalBookings(params);
    return NextResponse.json(bookings);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching rental bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);

    const body = await request.json();

    // Build the booking payload
    const bookingData: Record<string, any> = {
      status: body.status || 'publish',
    };

    // Helper function to format date without special characters
    const formatDate = (dateString: string): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    // Helper to sanitize text for title (remove special characters that WordPress might encode)
    const sanitizeTitle = (text: string): string => {
      if (!text) return '';
      // Decode any existing HTML entities first
      let decoded = text
        .replace(/&#8211;/g, '-') // En-dash
        .replace(/&#8212;/g, '-') // Em-dash
        .replace(/&#8217;/g, "'") // Right single quotation mark
        .replace(/&#8220;/g, '"') // Left double quotation mark
        .replace(/&#8221;/g, '"') // Right double quotation mark
        .replace(/&amp;/g, '&') // Ampersand
        .replace(/&lt;/g, '<') // Less than
        .replace(/&gt;/g, '>') // Greater than
        .replace(/&quot;/g, '"') // Quote
        .replace(/&#039;/g, "'") // Apostrophe
        .replace(/&nbsp;/g, ' '); // Non-breaking space
      
      // Replace problematic dash characters with regular ASCII dash
      // This is the main culprit - WordPress encodes en-dash/em-dash as HTML entities
      decoded = decoded.replace(/[–—]/g, '-');
      
      // Replace smart quotes with regular quotes
      decoded = decoded.replace(/[""]/g, '"').replace(/['']/g, "'");
      
      // Keep German umlauts and other valid UTF-8 characters, just fix the dashes
      return decoded.trim();
    };

    // Title will be set after meta fields are saved to avoid encoding issues

    // Build meta fields
    const meta: Record<string, any> = {};

    if (body.equipment && Array.isArray(body.equipment) && body.equipment.length > 0) {
      // Multi-booking
      const cartData = body.equipment.map((eq: any) => ({
        equipmentId: eq.id,
        quantity: eq.quantity || 1,
        title: eq.title || `Equipment ${eq.id}`,
      }));

      meta._booking_type = 'multi';
      meta._cart_data = JSON.stringify(cartData);
      meta._total_items = cartData.length;
      meta._total_quantity = cartData.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    } else if (body.equipment_id) {
      // Single booking
      meta._equipment_id = body.equipment_id;
      meta._quantity = body.quantity || 1;
      meta._booking_type = 'single';
    }

    // Common fields
    if (body.rental_start) meta._rental_start = body.rental_start;
    if (body.rental_end) meta._rental_end = body.rental_end;
    if (body.customer_name) meta._customer_name = body.customer_name;
    if (body.customer_email) meta._customer_email = body.customer_email;
    if (body.customer_phone) meta._customer_phone = body.customer_phone;
    if (body.customer_message) meta._customer_message = body.customer_message;
    meta._booking_status = body.booking_status || 'pending';
    meta._booking_date = new Date().toISOString();

    // Create booking with minimal title first (to avoid encoding issues)
    // Use a simple ID-based title that won't have encoding problems
    bookingData.title = `Buchung #${Date.now()}`;

    const booking = await wpApi.createRentalBooking(bookingData);
    
    // Always update meta fields after creation to ensure they're saved
    // This is necessary because rental_booking meta fields might not be registered for REST API
    console.log('Updating meta fields for booking:', booking.id, meta);
    await wpApi.updatePost('rental_booking', booking.id, { meta });
    
    // Now update the title with the proper format after meta fields are saved
    let finalTitle = '';
    if (body.equipment && Array.isArray(body.equipment) && body.equipment.length > 0) {
      const equipmentNames = body.equipment
        .slice(0, 2)
        .map((eq: any) => sanitizeTitle(eq.title || `Equipment ${eq.id}`))
        .join(', ');
      const customerName = sanitizeTitle(body.customer_name || 'Admin');
      const startDate = formatDate(body.rental_start);
      finalTitle = `Multi-Buchung: ${equipmentNames}${body.equipment.length > 2 ? '...' : ''} - ${customerName} (${startDate})`;
    } else if (body.equipment_id) {
      const customerName = sanitizeTitle(body.customer_name || 'Admin');
      const startDate = formatDate(body.rental_start);
      finalTitle = `Buchung: Equipment ${body.equipment_id} - ${customerName} (${startDate})`;
    } else {
      finalTitle = `Buchung: ${formatDate(new Date().toISOString())}`;
    }
    
    // Update title separately to avoid any encoding issues
    await wpApi.updatePost('rental_booking', booking.id, { title: finalTitle });
    
    // Fetch the final booking with all data
    const finalBooking = await wpApi.getRentalBooking(booking.id);
    console.log('Final booking meta:', finalBooking.meta);
    
    return NextResponse.json(finalBooking);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating rental booking:', error);
    return NextResponse.json(
      { error: 'Failed to create rental booking', details: error.response?.data },
      { status: 500 }
    );
  }
}

