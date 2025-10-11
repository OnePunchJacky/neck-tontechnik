'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-neutral)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            placeholder="Dein Name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            E-Mail *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-neutral)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            placeholder="deine@email.com"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Kommentar oder Nachricht
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-neutral)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
            placeholder="Erzähl mir mehr über dein Projekt..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] disabled:bg-[var(--color-primary-700)] text-[var(--color-text-primary)] px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
        >
          {isSubmitting ? 'Wird gesendet...' : 'Absenden'}
        </button>

        {submitStatus === 'success' && (
          <div className="p-4 bg-[var(--color-success)] bg-opacity-20 border border-[var(--color-success)] rounded-lg text-[var(--color-text-primary)]">
            Vielen Dank! Deine Nachricht wurde erfolgreich gesendet. Ich melde mich bald bei dir.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 bg-[var(--color-error)] bg-opacity-20 border border-[var(--color-error)] rounded-lg text-[var(--color-text-primary)]">
            Es gab einen Fehler beim Senden deiner Nachricht. Bitte versuche es noch einmal.
          </div>
        )}
      </form>
    </div>
  );
} 