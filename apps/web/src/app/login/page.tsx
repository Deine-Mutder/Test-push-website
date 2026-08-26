'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Anmeldung fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg dark:bg-bg-dark">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-primary" aria-hidden="true" />
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
            Willkommen zurück
          </h1>
          <p className="text-sm text-muted mt-1">
            Melde dich an und mach dort weiter, wo du aufgehört hast.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded bg-danger-50 text-danger text-sm px-3 py-2"
            >
              {error}
            </div>
          )}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="mt-1.5 text-right">
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Passwort vergessen?
              </Link>
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Noch kein Konto?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
