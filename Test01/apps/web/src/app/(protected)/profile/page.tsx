'use client';

import { useState, FormEvent } from 'react';
import { KeyRound, UserRound } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export default function ProfilePage() {
  const { user } = useAuthStore();

  // Profildaten
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Passwort ändern
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setIsSavingProfile(true);
    try {
      await api.patch('/users/me', { firstName, lastName });
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Speichern fehlgeschlagen.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setIsSavingPassword(true);
    try {
      await api.patch('/users/me/password', { currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(
        err instanceof ApiError ? err.message : 'Passwort konnte nicht geändert werden.',
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-up">
      <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
        Profil &amp; Einstellungen
      </h1>

      {/* Profildaten */}
      <section className="card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold mb-4 text-ink dark:text-ink-dark">
          <UserRound size={18} className="text-primary" />
          Profildaten
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileError && (
            <div role="alert" className="rounded bg-danger-50 text-danger text-sm px-3 py-2">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div role="status" className="rounded bg-success-50 text-success text-sm px-3 py-2">
              Profil wurde aktualisiert.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="label">
                Vorname
              </label>
              <input
                id="firstName"
                className="input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="label">
                Nachname
              </label>
              <input
                id="lastName"
                className="input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">E-Mail-Adresse</label>
            <input className="input opacity-60" value={user?.email ?? ''} disabled />
            <p className="text-xs text-muted mt-1.5">
              Die E-Mail-Adresse kann derzeit nicht geändert werden.
            </p>
          </div>
          <button type="submit" disabled={isSavingProfile} className="btn-primary">
            {isSavingProfile ? 'Wird gespeichert…' : 'Profil speichern'}
          </button>
        </form>
      </section>

      {/* Passwort ändern */}
      <section className="card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold mb-4 text-ink dark:text-ink-dark">
          <KeyRound size={18} className="text-primary" />
          Passwort ändern
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
          {passwordError && (
            <div role="alert" className="rounded bg-danger-50 text-danger text-sm px-3 py-2">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div role="status" className="rounded bg-success-50 text-success text-sm px-3 py-2">
              Passwort wurde geändert. Andere angemeldete Geräte wurden abgemeldet.
            </div>
          )}
          <div>
            <label htmlFor="currentPassword" className="label">
              Aktuelles Passwort
            </label>
            <input
              id="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="label">
              Neues Passwort
            </label>
            <input
              id="newPassword"
              type="password"
              required
              autoComplete="new-password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-muted mt-1.5">
              Mindestens 8 Zeichen, mit Groß-, Kleinbuchstaben und einer Zahl.
            </p>
          </div>
          <button type="submit" disabled={isSavingPassword} className="btn-primary">
            {isSavingPassword ? 'Wird geändert…' : 'Passwort ändern'}
          </button>
        </form>
      </section>
    </div>
  );
}
