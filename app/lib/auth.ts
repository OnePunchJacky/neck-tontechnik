// Authentication utilities

import { cookies } from 'next/headers';
import { WPSession } from './types';

const SESSION_COOKIE_NAME = 'wp_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function createSession(user: any, token: string): Promise<void> {
  const session: WPSession = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      capabilities: user.capabilities || {},
    },
    token,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function getSession(): Promise<WPSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie) {
      return null;
    }

    const session: WPSession = JSON.parse(sessionCookie.value);
    
    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await deleteSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<WPSession> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

