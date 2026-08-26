'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ClipboardList, ArrowRight, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import type { Subject, Topic } from '@/types';

export default function SubjectPage() {
  const params = useParams<{ subjectSlug?: string }>();
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingTest, setIsStartingTest] = useState(false);

  const subjectSlug = params?.subjectSlug;

  useEffect(() => {
    if (!subjectSlug) return;

    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const s = await api.get<Subject>(`/subjects/${subjectSlug}`);
        if (cancelled) return;
        setSubject(s);

        if (s?.placementCompleted) {
          try {
            const t = await api.get<Topic[]>(`/subjects/${subjectSlug}/topics`);
            if (!cancelled) setTopics(t);
          } catch {
            if (!cancelled) setTopics([]);
          }
        }
      } catch (err) {
        console.error('Fehler beim Laden:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [subjectSlug]);

  async function startPlacementTest() {
    if (!subjectSlug) return;
    setIsStartingTest(true);
    try {
      const attempt = await api.post<{ id: string }>(
        `/subjects/${subjectSlug}/placement-test/start`,
      );
      router.push(`/subjects/${subjectSlug}/placement-test?attemptId=${attempt.id}`);
    } catch (err) {
      console.error('Fehler beim Starten des Tests:', err);
    } finally {
      setIsStartingTest(false);
    }
  }

  if (isLoading || !subject) {
    return <div className="h-64 card animate-pulse" />;
  }

  return (
    <div className="animate-fade-up">
      {!subject.placementCompleted ? (
        <div className="max-w-xl mx-auto text-center py-12 animate-fade-up">
          <div
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: `${subject.colorHex}1A` }}
          >
            <ClipboardList size={28} style={{ color: subject.colorHex }} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
            Einstufungstest {subject.name}
          </h1>
          <p className="text-muted mt-3 leading-relaxed">
            Bevor du im Wissens-Wiki lernen kannst, ermitteln wir mit einem kurzen Einstufungstest
            deinen aktuellen Wissensstand.
          </p>
          <ul className="text-sm text-muted mt-6 space-y-2 text-left inline-block">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary shrink-0" /> 50 Fragen aus allen
              Themengebieten
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary shrink-0" /> Detaillierte Auswertung
              pro Thema
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary shrink-0" /> Danach: individueller
              Lernweg
            </li>
          </ul>
          <button
            onClick={startPlacementTest}
            disabled={isStartingTest}
            className="btn-primary mt-8"
          >
            {isStartingTest ? 'Test wird vorbereitet…' : 'Einstufungstest starten'}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen size={20} style={{ color: subject.colorHex }} />
            <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
              {subject.name} — Wissens-Wiki
            </h1>
          </div>
          <p className="text-muted mb-8">
            Themen mit Defizit stehen ganz oben. Wähle ein Thema, um zu lernen.
          </p>

          <div className="grid gap-3">
            {(topics ?? []).map((topic) => {
              const isDeficit = !!topic.deficit;
              const isCompleted = topic.mastery?.status === 'COMPLETED';
              return (
                <Link
                  key={topic.id}
                  href={`/subjects/${subjectSlug}/topics/${topic.id}/wiki`}
                  className={`card p-4 sm:p-5 flex items-center justify-between gap-4 hover:shadow-card-hover transition-shadow ${
                    isDeficit ? 'border-danger/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isDeficit ? (
                      <AlertTriangle size={18} className="text-danger shrink-0" />
                    ) : isCompleted ? (
                      <CheckCircle2 size={18} className="text-success shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-muted shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-ink dark:text-ink-dark truncate">{topic.name}</p>
                      {topic.description && (
                        <p className="text-xs text-muted truncate">{topic.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {isDeficit && topic.deficit && (
                      <span className="badge-deficit font-mono">
                        {Math.round(topic.deficit.scorePercent)}%
                      </span>
                    )}
                    {!isDeficit && isCompleted && (
                      <span className="badge-mastered font-mono">
                        {Math.round(topic.mastery?.bestScorePercent ?? 0)}%
                      </span>
                    )}
                    <ArrowRight size={16} className="text-muted" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}