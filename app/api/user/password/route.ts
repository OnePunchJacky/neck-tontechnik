import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { WordPressAPI } from '@/app/lib/wp-api';
import { requireAuth } from '@/app/lib/auth';

const changePasswordSchema = z.object({
  newPassword: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  currentPassword: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { newPassword, currentPassword } = changePasswordSchema.parse(body);

    const wpApi = new WordPressAPI(session.token);
    await wpApi.changePassword(newPassword, currentPassword);

    return NextResponse.json({ success: true, message: 'Passwort erfolgreich geändert' });
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

    console.error('Password change error:', error);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Fehler beim Ändern des Passworts' },
      { status: 500 }
    );
  }
}

