'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registrierung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-bg dark:bg-bg-dark">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-primary" aria-hidden="true" />
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
            Konto erstellen
          </h1>
          <p className="text-sm text-muted mt-1">
            Kostenlos starten und deinen Lernweg zum Realschulabschluss beginnen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
          {error && (
            <div role="alert" className="rounded bg-danger-50 text-danger text-sm px-3 py-2">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="label">
                Vorname
              </label>
              <input
                id="firstName"
                required
                className="input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="label">
                Nachname
              </label>
              <input
                id="lastName"
                required
                className="input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="label">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="password" className="label">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <p className="text-xs text-muted mt-1.5">
              Mindestens 8 Zeichen, mit Groß-, Kleinbuchstaben und einer Zahl.
            </p>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Konto wird erstellt…' : 'Konto erstellen'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Bereits registriert?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
