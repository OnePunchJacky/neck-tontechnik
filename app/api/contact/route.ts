import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  message: z.string().min(1, 'Nachricht ist erforderlich'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { name, email, message } = contactSchema.parse(body);

    // Check for API key
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('BREVO_API_KEY is not set');
      return NextResponse.json(
        { error: 'Kontaktformular ist nicht konfiguriert' },
        { status: 500 }
      );
    }

    // Send email via Brevo
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Neck Tontechnik Website',
          email: 'noreply@neck-tontechnik.com', // This should be a verified sender
        },
        to: [
          {
            email: 'vincent@neck-tontechnik.com',
            name: 'Vincent Neck',
          },
        ],
        replyTo: {
          email: email,
          name: name,
        },
        subject: `Neue Kontaktanfrage von ${name}`,
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
                <h2 style="margin: 0;">Neue Kontaktanfrage</h2>
              </div>

              <div class="info-row">
                <span class="label">Name:</span> ${name}
              </div>

              <div class="info-row">
                <span class="label">E-Mail:</span> <a href="mailto:${email}">${email}</a>
              </div>

              <div class="message-box">
                <div class="label">Nachricht:</div>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
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

    return NextResponse.json(
      { message: 'Nachricht erfolgreich gesendet!' },
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
