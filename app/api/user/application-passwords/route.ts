import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { WordPressAPI } from '@/app/lib/wp-api';
import { requireAuth } from '@/app/lib/auth';

const createAppPasswordSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
});

export async function GET() {
  try {
    const session = await requireAuth();
    const wpApi = new WordPressAPI(session.token);
    const passwords = await wpApi.getApplicationPasswords();
    return NextResponse.json(passwords);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Error fetching application passwords:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Application Passwords' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { name } = createAppPasswordSchema.parse(body);

    const wpApi = new WordPressAPI(session.token);
    const result = await wpApi.createApplicationPassword(name);

    return NextResponse.json({
      success: true,
      password: result.password, // WordPress returns the password only once
      uuid: result.uuid,
      name: result.name,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating application password:', error);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Fehler beim Erstellen des Application Passwords' },
      { status: 500 }
    );
  }
}

