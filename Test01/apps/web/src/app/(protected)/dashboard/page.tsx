'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { ProgressRing } from '@/components/ui/progress-ring';
import type { DashboardData } from '@/types';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} Min.`;
  return `${hours} Std. ${minutes} Min.`;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>('/dashboard')
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 animate-pulse">
        <div className="h-32 card" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-40 card" />
          <div className="h-40 card" />
          <div className="h-40 card" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Begrüßung + Gesamtfortschritt */}
      <section className="card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-ink-dark">
            Willkommen zurück, {data.greeting.firstName || user?.firstName}
          </h1>
          <p className="text-muted mt-1">
            Hier ist dein aktueller Lernstand für den Realschulabschluss.
          </p>
        </div>
        <ProgressRing
          percent={data.overallProgressPercent}
          size={110}
          strokeWidth={9}
          label="Gesamt"
        />
      </section>

      {/* Fortschritt pro Fach */}
      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-ink dark:text-ink-dark">
          Deine Fächer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.subjectProgress.map((subject) => (
            <Link
              key={subject.subjectId}
              href={`/subjects/${subject.slug}`}
              className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow group"
            >
              <ProgressRing
                percent={subject.progressPercent}
                size={64}
                strokeWidth={6}
                color={subject.colorHex}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-ink dark:text-ink-dark truncate">
                  {subject.name}
                </h3>
                <p className="text-xs text-muted">
                  {subject.completedTopics} von {subject.totalTopics} Themen abgeschlossen
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defizite */}
        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-ink dark:text-ink-dark">
            <AlertTriangle size={18} className="text-danger" />
            Deine Defizite
          </h2>
          {data.deficits.length === 0 ? (
            <p className="text-sm text-muted">
              Aktuell keine Defizite erkannt — weiter so!
            </p>
          ) : (
            <ul className="space-y-3">
              {data.deficits.map((d) => (
                <li key={d.topicId}>
                  <Link
                    href={`/subjects/${d.subjectSlug}`}
                    className="flex items-center justify-between gap-3 rounded p-2 -mx-2 hover:bg-danger-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink dark:text-ink-dark">
                        {d.topicName}
                      </p>
                      <p className="text-xs text-muted">{d.subjectName}</p>
                    </div>
                    <span className="badge-deficit font-mono">
                      {Math.round(d.scorePercent)}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Empfohlene nächste Themen */}
        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-ink dark:text-ink-dark">
            <Sparkles size={18} className="text-primary" />
            Empfohlen für dich
          </h2>
          {data.recommendedTopics.length === 0 ? (
            <p className="text-sm text-muted">
              Mach zuerst einen Einstufungstest, damit wir dir Themen empfehlen können.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.recommendedTopics.map((t) => (
                <li key={t.topicId}>
                  <Link
                    href={`/subjects/${t.subjectSlug}`}
                    className="flex items-center justify-between gap-3 rounded p-2 -mx-2 hover:bg-primary-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink dark:text-ink-dark">
                        {t.topicName}
                      </p>
                      <p className="text-xs text-muted">{t.subjectName}</p>
                    </div>
                    <ArrowRight size={14} className="text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Letzte Aktivitäten */}
        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 text-ink dark:text-ink-dark">
            Letzte Aktivitäten
          </h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-muted">Noch keine Tests absolviert.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-ink dark:text-ink-dark">
                      {a.topicName ?? 'Einstufungstest'}
                    </span>
                    <span className="text-muted"> · {a.subjectName}</span>
                  </div>
                  {a.scorePercent !== null && (
                    <span className="font-mono text-xs text-muted">
                      {Math.round(a.scorePercent)}%
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Lernzeit */}
        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-ink dark:text-ink-dark">
            <Clock size={18} className="text-primary" />
            Lernzeit
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-2xl font-bold text-ink dark:text-ink-dark">
                {formatDuration(data.studyTime.thisWeekSeconds)}
              </p>
              <p className="text-xs text-muted">Diese Woche</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-ink dark:text-ink-dark">
                {formatDuration(data.studyTime.totalSeconds)}
              </p>
              <p className="text-xs text-muted">Insgesamt</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
