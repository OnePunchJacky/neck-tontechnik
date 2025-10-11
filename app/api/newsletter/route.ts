import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    // Check for API key and template ID
    const apiKey = process.env.BREVO_API_KEY;
    const templateId = process.env.BREVO_DOI_TEMPLATE_ID;

    if (!apiKey) {
      console.error('BREVO_API_KEY is not set');
      return NextResponse.json(
        { error: 'Newsletter service ist nicht konfiguriert' },
        { status: 500 }
      );
    }

    if (!templateId) {
      console.error('BREVO_DOI_TEMPLATE_ID is not set');
      return NextResponse.json(
        { error: 'Newsletter service ist nicht konfiguriert' },
        { status: 500 }
      );
    }

    // Send double opt-in email via Brevo
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        to: [{ email }],
        templateId: parseInt(templateId),
        params: {
          email,
        },
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
      { message: 'Bitte überprüfe deine E-Mails und bestätige deine Anmeldung!' },
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
