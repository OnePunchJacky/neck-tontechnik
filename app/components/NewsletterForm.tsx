'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <form className="bg-[var(--color-surface-dark)] rounded-xl p-8 flex flex-col shadow-lg" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="text-[var(--color-text-primary)] font-semibold mb-2">E-Mail Adresse eingeben und dabeisein<span className="text-[var(--color-accent-red)]">*</span></label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="abc@xzy.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="mb-2 px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-neutral)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
      />
      <span className="text-xs text-[var(--color-text-muted)] mb-4">Gib deine E-Mail Adresse ein um dich anzumelden, z.B. abc@xyz.com</span>
      <button type="submit" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] text-[var(--color-text-primary)] font-semibold px-6 py-3 rounded-lg transition">Anmelden</button>
      {submitted && (
        <div className="mt-4 p-3 bg-[var(--color-success)] bg-opacity-20 border border-[var(--color-success)] rounded-lg text-[var(--color-text-primary)] text-center">
          Danke für deine Anmeldung!
        </div>
      )}
    </form>
  );
} 