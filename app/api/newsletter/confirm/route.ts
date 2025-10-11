import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { z } from 'zod';

const confirmSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { email } = confirmSchema.parse(body);

    // Check for API key and list ID
    const apiKey = process.env.BREVO_API_KEY;
    const listId = process.env.BREVO_LIST_ID;

    if (!apiKey) {
      console.error('BREVO_API_KEY is not set');
      return NextResponse.json(
        { error: 'Newsletter service ist nicht konfiguriert' },
        { status: 500 }
      );
    }

    if (!listId) {
      console.error('BREVO_LIST_ID is not set');
      return NextResponse.json(
        { error: 'Newsletter service ist nicht konfiguriert' },
        { status: 500 }
      );
    }

    // Add contact to Brevo list after confirmation
    await axios.post(
      'https://api.brevo.com/v3/contacts',
      {
        email,
        listIds: [parseInt(listId)],
        updateEnabled: true,
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
      }
    );

    return NextResponse.json(
      { message: 'Anmeldung erfolgreich bestätigt!' },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      console.error('Brevo API error:', error.response?.data);

      // Contact already exists in list
      if (error.response?.status === 400) {
        return NextResponse.json(
          { message: 'Diese E-Mail-Adresse ist bereits bestätigt!' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' },
        { status: 500 }
      );
    }

    // Generic error
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' },
      { status: 500 }
    );
  }
}
