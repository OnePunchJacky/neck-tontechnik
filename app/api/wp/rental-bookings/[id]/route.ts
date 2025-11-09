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

    const booking = await wpApi.getRentalBooking(parseInt(id));
    return NextResponse.json(booking);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching rental booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental booking' },
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

    // Get existing booking to preserve values
    const existingBooking = await wpApi.getRentalBooking(parseInt(id));
    const existingMeta = existingBooking.meta || {};

    // Helper function to format date without special characters
    const formatDate = (dateString: string): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    const updateData: Record<string, any> = {};

    // Update status
    if (body.status) {
      updateData.status = body.status;
    }

    // Build meta fields - merge with existing values
    const meta: Record<string, any> = { ...existingMeta };
    let shouldUpdateTitle = false;

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
      shouldUpdateTitle = true;
    } else if (body.equipment_id) {
      // Single booking
      meta._equipment_id = body.equipment_id;
      meta._quantity = body.quantity || 1;
      meta._booking_type = 'single';
      shouldUpdateTitle = true;
    }

    // Common fields - use new value if provided, otherwise keep existing
    if (body.rental_start !== undefined) {
      meta._rental_start = body.rental_start;
      shouldUpdateTitle = true;
    }
    if (body.rental_end !== undefined) {
      meta._rental_end = body.rental_end;
    }
    if (body.customer_name !== undefined) {
      meta._customer_name = body.customer_name;
      shouldUpdateTitle = true;
    }
    if (body.customer_email !== undefined) meta._customer_email = body.customer_email;
    if (body.customer_phone !== undefined) meta._customer_phone = body.customer_phone;
    if (body.customer_message !== undefined) meta._customer_message = body.customer_message;
    if (body.booking_status !== undefined) meta._booking_status = body.booking_status;

    // Helper to sanitize text for title (remove special characters that WordPress might encode)
    const sanitizeTitle = (text: string): string => {
      if (!text) return '';
      // Replace common special characters with ASCII equivalents
      return text
        .replace(/[–—]/g, '-') // Replace en-dash and em-dash with regular dash
        .replace(/[""]/g, '"') // Replace smart quotes with regular quotes
        .replace(/['']/g, "'") // Replace smart apostrophes with regular apostrophe
        .replace(/…/g, '...') // Replace ellipsis
        .trim();
    };

    // Regenerate title if equipment or dates changed
    if (shouldUpdateTitle && !body.title) {
      const rentalStart = body.rental_start || meta._rental_start || existingMeta._rental_start;
      const customerName = sanitizeTitle(body.customer_name || meta._customer_name || existingMeta._customer_name || 'Admin');
      
      if (body.equipment && Array.isArray(body.equipment) && body.equipment.length > 0) {
        const equipmentNames = body.equipment
          .slice(0, 2)
          .map((eq: any) => sanitizeTitle(eq.title || `Equipment ${eq.id}`))
          .join(', ');
        const startDate = formatDate(rentalStart);
        updateData.title = `Multi-Buchung: ${equipmentNames}${body.equipment.length > 2 ? '...' : ''} - ${customerName} (${startDate})`;
      } else if (body.equipment_id || meta._equipment_id || existingMeta._equipment_id) {
        const equipmentId = body.equipment_id || meta._equipment_id || existingMeta._equipment_id;
        const startDate = formatDate(rentalStart);
        updateData.title = `Buchung: Equipment ${equipmentId} - ${customerName} (${startDate})`;
      } else if (existingMeta._cart_data) {
        // Preserve existing multi-booking title format
        try {
          const cartData = JSON.parse(existingMeta._cart_data);
          if (Array.isArray(cartData) && cartData.length > 0) {
            const equipmentNames = cartData
              .slice(0, 2)
              .map((item: any) => sanitizeTitle(item.title || `Equipment ${item.equipmentId}`))
              .join(', ');
            const startDate = formatDate(rentalStart);
            updateData.title = `Multi-Buchung: ${equipmentNames}${cartData.length > 2 ? '...' : ''} - ${customerName} (${startDate})`;
          }
        } catch (e) {
          // If parsing fails, use default
        }
      }
    } else if (body.title) {
      updateData.title = body.title;
    }

    if (Object.keys(meta).length > 0) {
      updateData.meta = meta;
    }

    const updatedBooking = await wpApi.updateRentalBooking(parseInt(id), updateData);
    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating rental booking:', error);
    return NextResponse.json(
      { error: 'Failed to update rental booking', details: error.response?.data },
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

    await wpApi.deleteRentalBooking(parseInt(id), force);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting rental booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete rental booking' },
      { status: 500 }
    );
  }
}

