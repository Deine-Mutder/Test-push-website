'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/auth/password-reset/confirm', { token, newPassword });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Zurücksetzen fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg dark:bg-bg-dark">
      <div className="w-full max-w-sm animate-fade-up">
        <h1 className="font-display text-2xl font-semibold text-center mb-8 text-ink dark:text-ink-dark">
          Neues Passwort festlegen
        </h1>
        {success ? (
          <div className="card p-6 text-center text-sm text-success">
            Passwort erfolgreich geändert. Du wirst weitergeleitet…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            {error && (
              <div role="alert" className="rounded bg-danger-50 text-danger text-sm px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="newPassword" className="label">
                Neues Passwort
              </label>
              <input
                id="newPassword"
                type="password"
                required
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Wird gespeichert…' : 'Passwort ändern'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
