'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, HelpCircle, ClipboardList, PlusCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface PlatformStats {
  userCount: number;
  questionCount: number;
  completedPlacementTests: number;
  completedTopicTests: number;
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);

  const isFullAdmin = user?.role === 'ADMIN';
  const isQuestionEditorOnly = !isFullAdmin && user?.canManageQuestions;

  useEffect(() => {
    if (!isFullAdmin) return;
    api.get<PlatformStats>('/admin/statistics').then(setStats);
  }, [isFullAdmin]);

  // Weder voller Admin noch Fragen-Berechtigung -> kein Zugriff
  if (user && !isFullAdmin && !isQuestionEditorOnly) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        Für diesen Bereich sind Admin- oder Fragen-Berechtigungen erforderlich.
      </div>
    );
  }

  // Nur Fragen-Berechtigung -> schlanke Ansicht ohne Statistiken/Nutzerverwaltung
  if (isQuestionEditorOnly) {
    return (
      <div className="max-w-lg mx-auto animate-fade-up">
        <h1 className="font-display text-2xl font-semibold mb-2 text-ink dark:text-ink-dark">
          Fragen-Verwaltung
        </h1>
        <p className="text-muted mb-6">
          Du hast die Berechtigung, Fragen für das Wissens-Wiki zu erstellen und zu bearbeiten.
        </p>
        <Link href="/admin/questions/new" className="btn-primary">
          <PlusCircle size={16} /> Neue Frage erstellen
        </Link>
      </div>
    );
  }

  // Voller Admin
  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
          Admin-Bereich
        </h1>
        <Link href="/admin/questions/new" className="btn-primary">
          <PlusCircle size={16} /> Neue Frage erstellen
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Nutzer" value={stats?.userCount} />
        <StatCard icon={HelpCircle} label="Fragen gesamt" value={stats?.questionCount} />
        <StatCard
          icon={ClipboardList}
          label="Einstufungstests"
          value={stats?.completedPlacementTests}
        />
        <StatCard icon={ClipboardList} label="Themen-Tests" value={stats?.completedTopicTests} />
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold mb-2 text-ink dark:text-ink-dark">
          Content- &amp; Nutzerverwaltung
        </h2>
        <p className="text-sm text-muted mb-4">
          Fragen pflegen und festlegen, wer Zugriff auf welche Admin-Funktionen hat.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/admin/questions/new" className="btn-secondary">
            Frage erstellen
          </Link>
          <Link href="/admin/users" className="btn-secondary">
            Nutzer &amp; Berechtigungen verwalten
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value?: number;
}) {
  return (
    <div className="card p-5">
      <Icon size={18} className="text-primary mb-2" />
      <p className="font-mono text-2xl font-bold text-ink dark:text-ink-dark">
        {value ?? '–'}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
