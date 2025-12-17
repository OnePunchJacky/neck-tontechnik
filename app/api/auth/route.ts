import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { WordPressAPI } from '@/app/lib/wp-api';
import { createSession, deleteSession, getSession } from '@/app/lib/auth';

const loginSchema = z.object({
  username: z.string().min(1, 'Benutzername ist erforderlich'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    const wpApi = new WordPressAPI();
    let authResult;
    
    try {
      authResult = await wpApi.verifyCredentials(username, password);
    } catch (error: any) {
      // Check if WordPress specifically requires application password
      if (error.message === 'APPLICATION_PASSWORD_REQUIRED') {
        return NextResponse.json(
          { error: 'Diese WordPress-Installation erfordert ein Application Password. Bitte erstelle eines in WordPress (Benutzer → Profil → Application Passwords) und verwende es hier.' },
          { status: 401 }
        );
      }
      // Other errors will be handled below
      authResult = null;
    }

    if (!authResult) {
      console.error('Authentication failed for user:', username);
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten. Bitte überprüfe deine Anmeldedaten. Falls deine WordPress-Installation Application Passwords erfordert, verwende bitte ein Application Password.' },
        { status: 401 }
      );
    }

    // Check if user has edit capabilities
    // WordPress REST API returns capabilities in different formats
    const user = authResult.user;
    
    // Log the full user object to see what WordPress returns
    console.log('Full WordPress user object:', JSON.stringify(user, null, 2));
    
    const capabilities = user.capabilities || {};
    const roles = user.roles || [];
    
    // Check for admin role or edit capabilities
    // WordPress might return roles as an array or as object keys
    const roleArray = Array.isArray(roles) ? roles : Object.keys(roles).filter(key => roles[key] === true);
    const isAdmin = roleArray.includes('administrator') || 
                    roleArray.includes('editor') || 
                    roleArray.includes('author') ||
                    roleArray.some(role => ['administrator', 'editor', 'author'].includes(role));
    
    // Check capabilities - WordPress might return them as booleans, strings, or numbers
    const hasEditCapability = capabilities.edit_posts === true || 
                              capabilities.edit_pages === true || 
                              capabilities.administrator === true ||
                              capabilities.edit_posts === '1' ||
                              capabilities.edit_pages === '1' ||
                              capabilities.administrator === '1' ||
                              capabilities.edit_posts === 1 ||
                              capabilities.edit_pages === 1 ||
                              capabilities.administrator === 1 ||
                              // Check if any capability exists (some WordPress setups return all as true for admins)
                              Object.keys(capabilities).length > 0;

    console.log('User capabilities check:', {
      roles,
      roleArray,
      capabilities,
      isAdmin,
      hasEditCapability,
      capabilitiesKeys: Object.keys(capabilities),
      userData: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });

    // For now, if user successfully authenticated, allow access
    // We can tighten this later once we see the actual structure
    if (!isAdmin && !hasEditCapability && Object.keys(capabilities).length === 0) {
      console.warn('User might not have proper capabilities, but allowing access since authentication succeeded');
      // Still allow - authentication succeeded, so user exists
    }

    await createSession(authResult.user, authResult.token);

    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user.id,
        name: authResult.user.name,
        email: authResult.user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    // Return unauthenticated instead of 500 to prevent breaking the UI
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}

export async function DELETE() {
  try {
    await deleteSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}

