'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import type { TestAttempt } from '@/types';

interface QuizRunnerProps {
  attempt: TestAttempt;
  onSubmit: (answers: { questionId: string; selectedAnswerId: string | null }[]) => Promise<void>;
  isSubmitting: boolean;
}

export function QuizRunner({ attempt, onSubmit, isSubmitting }: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | null>>({});

  const question = attempt.questions[currentIndex];
  const totalAnswered = Object.values(selections).filter(Boolean).length;
  const progressPercent = Math.round((totalAnswered / attempt.questions.length) * 100);
  const isLast = currentIndex === attempt.questions.length - 1;

  function selectAnswer(answerId: string) {
    setSelections((prev) => ({ ...prev, [question.questionId]: answerId }));
  }

  function goNext() {
    if (!isLast) setCurrentIndex((i) => i + 1);
  }

  function goPrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  async function handleSubmit() {
    const answers = attempt.questions.map((q) => ({
      questionId: q.questionId,
      selectedAnswerId: selections[q.questionId] ?? null,
    }));
    await onSubmit(answers);
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      {/* Fortschrittsanzeige */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted mb-1.5">
          <span>
            Frage {currentIndex + 1} von {attempt.questions.length}
          </span>
          <span className="font-mono">{totalAnswered} beantwortet</span>
        </div>
        <div className="h-2 rounded-full bg-border dark:bg-border-dark overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / attempt.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Frage */}
      <div className="card p-6 sm:p-8">
        {question.topicName && (
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            {question.topicName}
          </span>
        )}
        <h2 className="font-display text-xl font-semibold mt-2 mb-6 text-ink dark:text-ink-dark">
          {question.prompt}
        </h2>

        <fieldset className="space-y-3">
          <legend className="sr-only">Antwortmöglichkeiten</legend>
          {question.answers.map((answer) => {
            const isSelected = selections[question.questionId] === answer.id;
            return (
              <label
                key={answer.id}
                className={`flex items-center gap-3 rounded border px-4 py-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary-50 dark:bg-primary/10'
                    : 'border-border dark:border-border-dark hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name={question.questionId}
                  checked={isSelected}
                  onChange={() => selectAnswer(answer.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-ink dark:text-ink-dark">{answer.text}</span>
              </label>
            );
          })}
        </fieldset>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="btn-secondary"
        >
          <ChevronLeft size={16} /> Zurück
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary"
          >
            <Send size={16} />
            {isSubmitting ? 'Wird ausgewertet…' : 'Test abgeben'}
          </button>
        ) : (
          <button onClick={goNext} className="btn-primary">
            Weiter <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
