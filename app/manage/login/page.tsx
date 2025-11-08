'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in (with a small delay to ensure page renders first)
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data.authenticated) {
          const redirect = searchParams.get('redirect') || '/manage';
          router.push(redirect);
        }
      } catch (error) {
        // Not logged in, stay on page
        console.log('Not authenticated, showing login form');
      }
    };
    
    // Small delay to ensure page renders
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Anmeldung fehlgeschlagen');
        setLoading(false);
        return;
      }

      // Redirect to dashboard or requested page
      const redirect = searchParams.get('redirect') || '/manage';
      router.push(redirect);
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-dark)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6 text-center">
            Admin Anmeldung
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Benutzername
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Application Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                autoComplete="current-password"
                placeholder="WordPress Application Password"
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Verwende ein Application Password aus WordPress (Benutzer → Profil → Application Passwords)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-dark)]">
        <div className="text-[var(--color-text-primary)]">Laden...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

