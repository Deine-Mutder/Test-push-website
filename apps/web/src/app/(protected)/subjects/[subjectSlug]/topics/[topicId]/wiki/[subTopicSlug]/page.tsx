'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  BookMarked,
  Lightbulb,
  ListChecks,
  AlertCircle,
  Sigma,
  ClipboardCheck,
  ListOrdered,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { SubTopic } from '@/types';

export default function SubTopicWikiPage() {
  const params = useParams<{ subjectSlug: string; topicId: string; subTopicSlug: string }>();
  const [subTopic, setSubTopic] = useState<SubTopic | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    startTimeRef.current = new Date();
    api
      .get<SubTopic>(
        `/subjects/${params.subjectSlug}/topics/${params.topicId}/wiki/${params.subTopicSlug}`,
      )
      .then(setSubTopic);

    // Lernzeit tracken: beim Verlassen der Seite Session loggen
    return () => {
      if (!startTimeRef.current) return;
      const endedAt = new Date();
      const durationSeconds = Math.round(
        (endedAt.getTime() - startTimeRef.current.getTime()) / 1000,
      );
      if (durationSeconds >= 5) {
        api
          .post('/progress/study-session', {
            topicId: params.topicId,
            durationSeconds,
            startedAt: startTimeRef.current.toISOString(),
            endedAt: endedAt.toISOString(),
          })
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.subjectSlug, params.topicId, params.subTopicSlug]);

  if (!subTopic) return <div className="h-96 max-w-2xl mx-auto card animate-pulse" />;

  return (
    <article className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-ink-dark">
          {subTopic.name}
        </h1>
      </header>

      <Section icon={BookMarked} title="Erklärung">
        <p className="leading-relaxed text-ink dark:text-ink-dark whitespace-pre-line">
          {subTopic.explanation}
        </p>
      </Section>

      {subTopic.definitions && subTopic.definitions.length > 0 && (
        <Section icon={ListChecks} title="Definitionen">
          <dl className="space-y-3">
            {subTopic.definitions.map((d, i) => (
              <div key={i}>
                <dt className="font-medium text-sm text-ink dark:text-ink-dark">{d.term}</dt>
                <dd className="text-sm text-muted mt-0.5">{d.definition}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {subTopic.formulas && subTopic.formulas.length > 0 && (
        <Section icon={Sigma} title="Formeln">
          <div className="grid gap-3">
            {subTopic.formulas.map((f, i) => (
              <div key={i} className="rounded bg-primary-50 dark:bg-primary/10 px-4 py-3">
                <p className="font-mono text-base font-semibold text-primary">{f.formula}</p>
                <p className="text-xs text-muted mt-1">{f.label}</p>
                {f.description && <p className="text-xs text-muted mt-0.5">{f.description}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {subTopic.examples && subTopic.examples.length > 0 && (
        <Section icon={Lightbulb} title="Beispiele">
          <div className="space-y-3">
            {subTopic.examples.map((e, i) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <p className="text-sm font-medium text-ink dark:text-ink-dark">{e.title}</p>
                <p className="text-sm text-muted mt-0.5">{e.content}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {subTopic.stepByStepGuides && subTopic.stepByStepGuides.length > 0 && (
        <Section icon={ListOrdered} title="Schritt für Schritt">
          {subTopic.stepByStepGuides.map((guide, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <p className="text-sm font-medium text-ink dark:text-ink-dark mb-2">
                {guide.title}
              </p>
              <ol className="space-y-1.5 list-decimal list-inside">
                {guide.steps.map((step, j) => (
                  <li key={j} className="text-sm text-muted">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </Section>
      )}

      {subTopic.commonMistakes && subTopic.commonMistakes.length > 0 && (
        <Section icon={AlertCircle} title="Häufige Fehler">
          <ul className="space-y-3">
            {subTopic.commonMistakes.map((m, i) => (
              <li key={i} className="text-sm">
                <p className="text-danger">✕ {m.mistake}</p>
                <p className="text-success mt-0.5">✓ {m.correction}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {subTopic.examTaskExamples && subTopic.examTaskExamples.length > 0 && (
        <Section icon={ClipboardCheck} title="Typische Prüfungsaufgabe">
          {subTopic.examTaskExamples.map((ex, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <p className="text-sm font-medium text-ink dark:text-ink-dark">{ex.question}</p>
              <p className="text-sm text-success mt-1">Lösung: {ex.solution}</p>
              <p className="text-xs text-muted mt-1">{ex.explanation}</p>
            </div>
          ))}
        </Section>
      )}

      {subTopic.tips && subTopic.tips.length > 0 && (
        <div className="rounded bg-success-50 p-4">
          <p className="text-xs font-medium text-success uppercase tracking-wide mb-2">Tipps</p>
          <ul className="space-y-1">
            {subTopic.tips.map((tip, i) => (
              <li key={i} className="text-sm text-ink dark:text-ink-dark">
                💡 {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {subTopic.keyTakeaways && subTopic.keyTakeaways.length > 0 && (
        <div className="card p-5 border-l-4 border-primary">
          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
            Zusammenfassung / Merksätze
          </p>
          <ul className="space-y-1.5">
            {subTopic.keyTakeaways.map((k, i) => (
              <li key={i} className="text-sm font-medium text-ink dark:text-ink-dark">
                • {k}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted mt-3 leading-relaxed">{subTopic.summary}</p>
        </div>
      )}
    </article>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof BookMarked;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold mb-3 text-ink dark:text-ink-dark">
        <Icon size={18} className="text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}
