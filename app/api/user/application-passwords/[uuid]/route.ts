import { NextRequest, NextResponse } from 'next/server';
import { WordPressAPI } from '@/app/lib/wp-api';
import { requireAuth } from '@/app/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const session = await requireAuth();
    const { uuid } = await params;
    const wpApi = new WordPressAPI(session.token);
    await wpApi.revokeApplicationPassword(uuid);

    return NextResponse.json({ success: true, message: 'Application Password erfolgreich widerrufen' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Error revoking application password:', error);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Fehler beim Widerrufen des Application Passwords' },
      { status: 500 }
    );
  }
}

