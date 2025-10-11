import { Suspense } from 'react';
import NewsletterConfirmContent from './NewsletterConfirmContent';

export default function NewsletterConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-[var(--color-surface-dark)] rounded-xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Laden...
            </h1>
          </div>
        </div>
      }
    >
      <NewsletterConfirmContent />
    </Suspense>
  );
}
