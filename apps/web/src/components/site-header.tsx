'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, LogOut, LayoutDashboard, ShieldCheck, PenSquare, UserRound } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useTheme } from '@/lib/theme-provider';

export function SiteHeader() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const isFullAdmin = user?.role === 'ADMIN';
  // Nutzer mit reiner Fragen-Berechtigung (ohne vollen Admin-Zugriff) sehen
  // einen eigenen, schlankeren Einstiegspunkt direkt zur Fragenerstellung.
  const isQuestionEditorOnly = !isFullAdmin && user?.canManageQuestions;

  return (
    <header className="sticky top-0 z-40 border-b border-border dark:border-border-dark bg-surface/90 dark:bg-surface-dark/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-display font-semibold text-lg">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          Lernkompass Sachsen
        </Link>

        <nav className="hidden sm:flex items-center gap-1" aria-label="Hauptnavigation">
          <Link
            href="/dashboard"
            className={`btn-ghost !px-3 ${pathname === '/dashboard' ? 'text-primary' : ''}`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          {isFullAdmin && (
            <Link
              href="/admin"
              className={`btn-ghost !px-3 ${pathname?.startsWith('/admin') ? 'text-primary' : ''}`}
            >
              <ShieldCheck size={16} /> Admin
            </Link>
          )}
          {isQuestionEditorOnly && (
            <Link
              href="/admin/questions/new"
              className={`btn-ghost !px-3 ${pathname?.startsWith('/admin') ? 'text-primary' : ''}`}
            >
              <PenSquare size={16} /> Fragen erstellen
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="btn-ghost !px-2.5"
            aria-label={theme === 'light' ? 'Dark Mode aktivieren' : 'Light Mode aktivieren'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {user && (
            <Link href="/profile" className="btn-ghost !px-2.5" aria-label="Profil & Einstellungen">
              <UserRound size={18} />
            </Link>
          )}
          {user && (
            <button onClick={logout} className="btn-ghost !px-2.5" aria-label="Abmelden">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
