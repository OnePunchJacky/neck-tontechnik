'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function NewsletterConfirmPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const email = searchParams.get('email');

    if (!email) {
      setStatus('error');
      setMessage('Ungültiger Bestätigungslink.');
      return;
    }

    const confirmSubscription = async () => {
      try {
        const response = await fetch('/api/newsletter/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Deine Newsletter-Anmeldung wurde erfolgreich bestätigt!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Ein Fehler ist aufgetreten.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
      }
    };

    confirmSubscription();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[var(--color-surface-dark)] rounded-xl p-8 shadow-lg text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Bestätigung läuft...
            </h1>
            <p className="text-[var(--color-text-muted)]">
              Bitte warten Sie einen Moment.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-[var(--color-success)] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[var(--color-success)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Erfolgreich bestätigt!
            </h1>
            <p className="text-[var(--color-text-muted)] mb-6">{message}</p>
            <Link
              href="/"
              className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] text-[var(--color-text-primary)] font-semibold px-6 py-3 rounded-lg transition"
            >
              Zur Startseite
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-[var(--color-accent-red)] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[var(--color-accent-red)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Fehler
            </h1>
            <p className="text-[var(--color-text-muted)] mb-6">{message}</p>
            <Link
              href="/"
              className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] text-[var(--color-text-primary)] font-semibold px-6 py-3 rounded-lg transition"
            >
              Zur Startseite
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
