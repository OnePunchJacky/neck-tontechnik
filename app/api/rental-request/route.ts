import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    
    // Create FormData for WordPress AJAX request
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(requestData).forEach(key => {
      if (typeof requestData[key] === 'object') {
        formData.append(key, JSON.stringify(requestData[key]));
      } else {
        formData.append(key, requestData[key]);
      }
    });
    
    formData.append('action', 'multi_rental_request');
    formData.append('nonce', 'rental_nonce'); // You'd get this from WordPress localization
    
    // Submit to WordPress AJAX handler
    const response = await fetch('https://staging.neck-tontechnik.com/wp-admin/admin-ajax.php', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('WordPress AJAX request failed');
    }
    
    const result = await response.json();
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: result.data }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing rental request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}