'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/auth/password-reset/request', { email });
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg dark:bg-bg-dark">
      <div className="w-full max-w-sm animate-fade-up">
        <h1 className="font-display text-2xl font-semibold text-center mb-2 text-ink dark:text-ink-dark">
          Passwort zurücksetzen
        </h1>
        <p className="text-sm text-muted text-center mb-8">
          Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen.
        </p>

        {submitted ? (
          <div className="card p-6 text-center">
            <p className="text-sm text-ink dark:text-ink-dark">
              Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum
              Zurücksetzen versendet.
            </p>
            <Link href="/login" className="btn-secondary mt-4 inline-flex">
              Zurück zur Anmeldung
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label htmlFor="email" className="label">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Wird gesendet…' : 'Link anfordern'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
