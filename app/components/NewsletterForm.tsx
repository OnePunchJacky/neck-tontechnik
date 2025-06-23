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
    <form className="bg-zinc-900 rounded-xl p-8 flex flex-col shadow-lg" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="text-white font-semibold mb-2">E-Mail Adresse eingeben und dabeisein<span className="text-red-500">*</span></label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="abc@xzy.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="mb-2 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <span className="text-xs text-gray-400 mb-4">Gib deine E-Mail Adresse ein um dich anzumelden, z.B. abc@xyz.com</span>
      <button type="submit" className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold px-6 py-3 rounded-lg transition">Anmelden</button>
      {submitted && (
        <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded-lg text-green-100 text-center">
          Danke für deine Anmeldung!
        </div>
      )}
    </form>
  );
} 