'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { ProgressRing } from '@/components/ui/progress-ring';
import type { TestResult } from '@/types';

export function TestResultView({ result }: { result: TestResult }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* Gesamtergebnis */}
      <div className="card p-8 flex flex-col items-center text-center">
        <ProgressRing percent={result.scorePercent} size={130} strokeWidth={10} />
        <h1 className="font-display text-xl font-semibold mt-4 text-ink dark:text-ink-dark">
          {result.correctCount} von {result.totalQuestions} Fragen richtig
        </h1>
        <p className="text-muted text-sm mt-1">
          {result.scorePercent >= 75
            ? 'Stark! Dieses Thema beherrschst du gut.'
            : 'Hier gibt es noch Potenzial — wir zeigen dir gezielt, woran du arbeiten kannst.'}
        </p>
      </div>

      {/* Themen-Breakdown (nur bei Einstufungstest relevant) */}
      {result.topicBreakdown.length > 1 && (
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 text-ink dark:text-ink-dark">
            Auswertung nach Themengebiet
          </h2>
          <div className="space-y-3">
            {result.topicBreakdown
              .sort((a, b) => a.scorePercent - b.scorePercent)
              .map((t) => (
                <div key={t.topicId} className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink dark:text-ink-dark truncate">
                      {t.topicName}
                    </p>
                    <div className="h-1.5 rounded-full bg-border dark:bg-border-dark overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${t.scorePercent}%`,
                          backgroundColor: t.isDeficit ? '#E4572E' : '#0F9D78',
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs font-medium shrink-0 ${t.isDeficit ? 'badge-deficit' : 'badge-mastered'}`}
                  >
                    {Math.round(t.scorePercent)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Fragenauflösung */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold mb-4 text-ink dark:text-ink-dark">
          Antworten im Detail
        </h2>
        <ul className="divide-y divide-border dark:divide-border-dark">
          {result.questions.map((q) => {
            const isExpanded = expandedId === q.questionId;
            return (
              <li key={q.questionId} className="py-3">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.questionId)}
                  className="w-full flex items-center justify-between gap-3 text-left"
                  aria-expanded={isExpanded}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {q.isCorrect ? (
                      <CheckCircle2 size={16} className="text-success shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-danger shrink-0" />
                    )}
                    <span className="text-sm text-ink dark:text-ink-dark truncate">
                      {q.prompt}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-muted shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                {isExpanded && (
                  <div className="mt-3 pl-6 space-y-2">
                    <ul className="space-y-1.5">
                      {q.answers.map((a) => (
                        <li
                          key={a.id}
                          className={`text-sm px-3 py-1.5 rounded ${
                            a.isCorrect
                              ? 'bg-success-50 text-success'
                              : a.id === q.selectedAnswerId
                                ? 'bg-danger-50 text-danger'
                                : 'text-muted'
                          }`}
                        >
                          {a.text}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted mt-2 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
