import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { WordPressAPI } from '@/app/lib/wp-api';
import axios from 'axios';

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
    // Allow public submissions (customers) - no auth required
    // For admin access, we'll use a different approach or check for session
    let wpApi: WordPressAPI;
    let isAdmin = false;
    
    try {
      const session = await requireAuth();
      wpApi = new WordPressAPI(session.token);
      isAdmin = true;
    } catch {
      // Public submission - use WordPress application password for public API access
      // This should be a base64 encoded username:application_password
      const publicToken = process.env.WP_PUBLIC_API_TOKEN;
      if (!publicToken) {
        console.error('WP_PUBLIC_API_TOKEN not set - cannot create public bookings');
        return NextResponse.json(
          { error: 'Service nicht verfügbar. Bitte kontaktieren Sie uns direkt.' },
          { status: 503 }
        );
      }
      wpApi = new WordPressAPI(publicToken);
    }

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
        equipmentId: eq.equipmentId || eq.id,
        quantity: eq.quantity || 1,
        title: eq.title || `Equipment ${eq.equipmentId || eq.id}`,
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
    // Set status to "Anfrage" for customer submissions, or use provided status for admin
    meta._booking_status = body.booking_status || 'anfrage';
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
    
    // Send emails (only if customer email is provided)
    if (body.customer_email) {
      try {
        await sendBookingEmails(body, finalBooking);
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the request if email fails
      }
    }
    
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

async function sendBookingEmails(body: any, booking: any) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set - cannot send emails');
    return;
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Calculate price for a single equipment item
  const calculateEquipmentPrice = (equipment: any, quantity: number, startDate: string, endDate: string): number => {
    if (!startDate || !endDate || quantity <= 0) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const dailyRate = equipment.meta?._tagesmiete || 0;
    const weekendRate = equipment.meta?._wochenendmiete || 0;
    const weeklyRate = equipment.meta?._wochenmiete || 0;
    const monthlyRate = equipment.meta?._monatsmiete || 0;
    
    let rentalPrice = 0;
    
    // Determine best pricing (same logic as frontend)
    if (days >= 28 && monthlyRate > 0) {
      const months = Math.ceil(days / 28);
      rentalPrice = monthlyRate * months * quantity;
    } else if (days >= 7 && weeklyRate > 0) {
      const weeks = Math.ceil(days / 7);
      rentalPrice = weeklyRate * weeks * quantity;
    } else if (days >= 2 && days <= 3 && weekendRate > 0) {
      rentalPrice = weekendRate * quantity;
    } else {
      rentalPrice = dailyRate * days * quantity;
    }
    
    return rentalPrice;
  };

  const customerName = body.customer_name || 'Kunde';
  const customerEmail = body.customer_email;
  const rentalStart = formatDate(body.rental_start);
  const rentalEnd = formatDate(body.rental_end);
  const customerPhone = body.customer_phone || 'Nicht angegeben';
  const customerMessage = body.customer_message || 'Keine Nachricht';

  // Fetch equipment data and calculate prices
  let equipmentList = '';
  let totalPrice = 0;
  let equipmentDetails: Array<{ title: string; quantity: number; price: number }> = [];

  if (body.equipment && Array.isArray(body.equipment) && body.equipment.length > 0) {
    // Fetch equipment details from WordPress
    const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://staging.neck-tontechnik.com/wp-json/wp/v2';
    
    for (const eq of body.equipment) {
      try {
        const equipmentResponse = await axios.get(`${WORDPRESS_API_URL}/gear/${eq.equipmentId || eq.id}`);
        const equipment = equipmentResponse.data;
        const quantity = eq.quantity || 1;
        const price = calculateEquipmentPrice(equipment, quantity, body.rental_start, body.rental_end);
        totalPrice += price;
        
        equipmentDetails.push({
          title: eq.title || `${equipment.meta?._equipment_brand || ''} ${equipment.meta?._equipment_model || ''}`.trim() || `Equipment ${eq.equipmentId || eq.id}`,
          quantity,
          price
        });
      } catch (error) {
        console.error(`Error fetching equipment ${eq.equipmentId || eq.id}:`, error);
        // Fallback to basic info
        const quantity = eq.quantity || 1;
        equipmentDetails.push({
          title: eq.title || `Equipment ${eq.equipmentId || eq.id}`,
          quantity,
          price: 0
        });
      }
    }
    
    equipmentList = equipmentDetails.map((eq, index) => 
      `${index + 1}. ${eq.title} (${eq.quantity}x) - ${formatPrice(eq.price)}`
    ).join('<br>');
  } else if (body.equipment_id) {
    try {
      const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://staging.neck-tontechnik.com/wp-json/wp/v2';
      const equipmentResponse = await axios.get(`${WORDPRESS_API_URL}/gear/${body.equipment_id}`);
      const equipment = equipmentResponse.data;
      const quantity = body.quantity || 1;
      totalPrice = calculateEquipmentPrice(equipment, quantity, body.rental_start, body.rental_end);
      
      const title = `${equipment.meta?._equipment_brand || ''} ${equipment.meta?._equipment_model || ''}`.trim() || `Equipment ${body.equipment_id}`;
      equipmentList = `${title} (${quantity}x) - ${formatPrice(totalPrice)}`;
    } catch (error) {
      console.error(`Error fetching equipment ${body.equipment_id}:`, error);
      equipmentList = `Equipment ID: ${body.equipment_id} (${body.quantity || 1}x)`;
    }
  }

  // Send confirmation email to customer
  if (customerEmail) {
    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: 'Neck Tontechnik',
            email: 'noreply@neck-tontechnik.com',
          },
          to: [
            {
              email: customerEmail,
              name: customerName,
            },
          ],
          subject: 'Bestätigung Ihrer Mietanfrage - Neck Tontechnik',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  background-color: #f9f9f9;
                  border: 1px solid #e0e0e0;
                  border-radius: 8px;
                  padding: 30px;
                }
                .header {
                  background-color: #282B1E;
                  color: #F5F5F5;
                  padding: 20px;
                  border-radius: 8px 8px 0 0;
                  margin: -30px -30px 20px -30px;
                }
                .info-row {
                  margin-bottom: 15px;
                }
                .label {
                  font-weight: 600;
                  color: #555;
                }
                .equipment-list {
                  background-color: #fff;
                  border-left: 4px solid #282B1E;
                  padding: 15px;
                  margin-top: 20px;
                  border-radius: 4px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0;">Vielen Dank für Ihre Mietanfrage!</h2>
                </div>

                <p>Liebe/r ${customerName},</p>

                <p>vielen Dank für Ihre Mietanfrage. Wir haben folgende Anfrage erhalten:</p>

                <div class="info-row">
                  <span class="label">Mietbeginn:</span> ${rentalStart}
                </div>

                <div class="info-row">
                  <span class="label">Mietende:</span> ${rentalEnd}
                </div>

                <div class="equipment-list">
                  <div class="label">Gewünschtes Equipment:</div>
                  <div style="margin-top: 10px;">${equipmentList}</div>
                </div>

                ${totalPrice > 0 ? `
                  <div class="info-row" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #282B1E;">
                    <span class="label" style="font-size: 18px;">Gesamtpreis (Miete):</span>
                    <span style="font-size: 18px; font-weight: bold; color: #282B1E;">${formatPrice(totalPrice)}</span>
                  </div>
                  <p style="font-size: 12px; color: #666; margin-top: 10px; font-style: italic;">
                    Hinweis: Eine angemessene Kaution wird dem finalen Angebot hinzugefügt.
                  </p>
                ` : ''}

                <p style="margin-top: 20px;">Wir werden Ihre Anfrage schnellstmöglich bearbeiten und uns bei Ihnen melden.</p>

                <p>Mit freundlichen Grüßen<br>Ihr Neck Tontechnik Team</p>
              </div>
            </body>
            </html>
          `,
        },
        {
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error sending customer confirmation email:', error);
    }
  }

  // Send notification email to admin
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Neck Tontechnik Website',
          email: 'noreply@neck-tontechnik.com',
        },
        to: [
          {
            email: 'vincent@neck-tontechnik.com',
            name: 'Vincent Neck',
          },
        ],
        replyTo: {
          email: customerEmail,
          name: customerName,
        },
        subject: `Neue Mietanfrage von ${customerName}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9f9f9;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 30px;
              }
              .header {
                background-color: #282B1E;
                color: #F5F5F5;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                margin: -30px -30px 20px -30px;
              }
              .info-row {
                margin-bottom: 15px;
              }
              .label {
                font-weight: 600;
                color: #555;
              }
              .equipment-list {
                background-color: #fff;
                border-left: 4px solid #282B1E;
                padding: 15px;
                margin-top: 20px;
                border-radius: 4px;
              }
              .message-box {
                background-color: #fff;
                border-left: 4px solid #282B1E;
                padding: 15px;
                margin-top: 20px;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">Neue Mietanfrage</h2>
              </div>

              <div class="info-row">
                <span class="label">Kunde:</span> ${customerName}
              </div>

              <div class="info-row">
                <span class="label">E-Mail:</span> <a href="mailto:${customerEmail}">${customerEmail}</a>
              </div>

              <div class="info-row">
                <span class="label">Telefon:</span> ${customerPhone}
              </div>

              <div class="info-row">
                <span class="label">Mietbeginn:</span> ${rentalStart}
              </div>

              <div class="info-row">
                <span class="label">Mietende:</span> ${rentalEnd}
              </div>

              <div class="equipment-list">
                <div class="label">Gewünschtes Equipment:</div>
                <div style="margin-top: 10px;">${equipmentList}</div>
              </div>

              ${totalPrice > 0 ? `
                <div class="info-row" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #282B1E;">
                  <span class="label" style="font-size: 18px;">Gesamtpreis (Miete):</span>
                  <span style="font-size: 18px; font-weight: bold; color: #282B1E;">${formatPrice(totalPrice)}</span>
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 10px; font-style: italic;">
                  Hinweis: Eine angemessene Kaution wird dem finalen Angebot hinzugefügt.
                </p>
              ` : ''}

              ${customerMessage !== 'Keine Nachricht' ? `
                <div class="message-box">
                  <div class="label">Nachricht vom Kunden:</div>
                  <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${customerMessage}</p>
                </div>
              ` : ''}

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 12px; color: #666;">
                  Buchungs-ID: ${booking.id}<br>
                  Status: ${booking.meta?._booking_status || 'pending'}
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending admin notification email:', error);
  }
}

