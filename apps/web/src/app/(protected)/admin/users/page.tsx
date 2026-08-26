'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, PenSquare } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import type { AdminUserRow } from '@/types';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  function loadUsers() {
    api.get<AdminUserRow[]>('/admin/users').then(setUsers);
  }

  async function toggleAdminRole(u: AdminUserRow) {
    setError(null);
    setPendingUserId(u.id);
    const nextRole = u.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    try {
      await api.patch(`/admin/users/${u.id}/role`, { role: nextRole });
      loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Rolle konnte nicht geändert werden.');
    } finally {
      setPendingUserId(null);
    }
  }

  async function toggleQuestionPermission(u: AdminUserRow) {
    setError(null);
    setPendingUserId(u.id);
    try {
      await api.patch(`/admin/users/${u.id}/permissions`, {
        canManageQuestions: !u.canManageQuestions,
      });
      loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Berechtigung konnte nicht geändert werden.');
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-2xl font-semibold mb-2 text-ink dark:text-ink-dark">
        Nutzerverwaltung
      </h1>
      <p className="text-muted text-sm mb-6">
        Vergib Admin-Panel-Zugriff oder ausschließlich die Berechtigung, Fragen zu erstellen —
        z.B. für Lehrkräfte, die nur Inhalte pflegen sollen.
      </p>

      {error && (
        <div role="alert" className="rounded bg-danger-50 text-danger text-sm px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border dark:border-border-dark text-left text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">E-Mail</th>
              <th className="px-4 py-3 font-medium">Admin-Panel</th>
              <th className="px-4 py-3 font-medium">Fragen erstellen</th>
              <th className="px-4 py-3 font-medium">Registriert</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => {
              const isSelf = u.id === currentUser?.id;
              const isPending = pendingUserId === u.id;
              return (
                <tr
                  key={u.id}
                  className="border-b border-border dark:border-border-dark last:border-0"
                >
                  <td className="px-4 py-3 text-ink dark:text-ink-dark">
                    {u.firstName} {u.lastName}
                    {isSelf && <span className="text-xs text-muted"> (du)</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAdminRole(u)}
                      disabled={isPending || (isSelf && u.role === 'ADMIN')}
                      title={
                        isSelf && u.role === 'ADMIN'
                          ? 'Du kannst dir selbst nicht die Admin-Rolle entziehen.'
                          : undefined
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        u.role === 'ADMIN'
                          ? 'bg-primary-50 text-primary'
                          : 'bg-border/50 dark:bg-border-dark/50 text-muted hover:text-ink dark:hover:text-ink-dark'
                      }`}
                    >
                      <ShieldCheck size={13} />
                      {u.role === 'ADMIN' ? 'Aktiv' : 'Vergeben'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleQuestionPermission(u)}
                      disabled={isPending || u.role === 'ADMIN'}
                      title={
                        u.role === 'ADMIN'
                          ? 'Volle Admins haben ohnehin Zugriff auf die Fragenerstellung.'
                          : undefined
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        u.canManageQuestions || u.role === 'ADMIN'
                          ? 'bg-success-50 text-success'
                          : 'bg-border/50 dark:bg-border-dark/50 text-muted hover:text-ink dark:hover:text-ink-dark'
                      }`}
                    >
                      <PenSquare size={13} />
                      {u.canManageQuestions || u.role === 'ADMIN' ? 'Aktiv' : 'Vergeben'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(u.createdAt).toLocaleDateString('de-DE')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted mt-4">
        Hinweis: Eine neu vergebene Berechtigung wird beim betroffenen Nutzer spätestens nach
        Ablauf des aktuellen Zugriffstokens (15 Minuten) automatisch aktiv, spätestens aber nach
        erneutem Anmelden.
      </p>
    </div>
  );
}
