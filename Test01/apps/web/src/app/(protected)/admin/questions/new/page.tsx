'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, PlusCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface AnswerDraft {
  text: string;
  isCorrect: boolean;
}

interface SubjectOption {
  id: string;
  slug: string;
  name: string;
}

interface TopicOption {
  id: string;
  slug: string;
  name: string;
  _count: { questions: number };
}

export default function NewQuestionPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [usage, setUsage] = useState('BOTH');
  const [answers, setAnswers] = useState<AnswerDraft[]>([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fächer beim Laden der Seite abrufen
  useEffect(() => {
    api.get<SubjectOption[]>('/admin/subjects').then((data) => {
      setSubjects(data);
      if (data.length > 0) setSubjectId(data[0].id);
    });
  }, []);

  // Themen neu laden, sobald sich das gewählte Fach ändert
  useEffect(() => {
    if (!subjectId) return;
    setIsLoadingTopics(true);
    setTopicId('');
    api
      .get<TopicOption[]>(`/admin/subjects/${subjectId}/topics`)
      .then((data) => {
        setTopics(data);
        if (data.length > 0) setTopicId(data[0].id);
      })
      .finally(() => setIsLoadingTopics(false));
  }, [subjectId]);

  function updateAnswer(index: number, patch: Partial<AnswerDraft>) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function setCorrect(index: number) {
    setAnswers((prev) => prev.map((a, i) => ({ ...a, isCorrect: i === index })));
  }

  function addAnswer() {
    setAnswers((prev) => [...prev, { text: '', isCorrect: false }]);
  }

  function removeAnswer(index: number) {
    setAnswers((prev) => prev.filter((_, i) => i !== index));
  }

  function resetFormKeepSelection() {
    setPrompt('');
    setExplanation('');
    setAnswers([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!topicId) {
      setError('Bitte ein Thema auswählen.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/questions', {
        topicId,
        prompt,
        explanation,
        difficulty,
        usage,
        answers,
      });
      const topicName = topics.find((t) => t.id === topicId)?.name ?? '';
      setSuccessMessage(`Frage zu „${topicName}" wurde gespeichert.`);
      resetFormKeepSelection();
      // Themen-Liste neu laden, damit die Fragenanzahl (_count) aktuell ist
      const refreshed = await api.get<TopicOption[]>(`/admin/subjects/${subjectId}/topics`);
      setTopics(refreshed);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Frage konnte nicht erstellt werden.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <h1 className="font-display text-2xl font-semibold mb-6 text-ink dark:text-ink-dark">
        Neue Frage erstellen
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && (
          <div role="alert" className="rounded bg-danger-50 text-danger text-sm px-3 py-2">
            {error}
          </div>
        )}
        {successMessage && (
          <div role="status" className="rounded bg-success-50 text-success text-sm px-3 py-2">
            {successMessage} Du kannst direkt die nächste Frage zum selben Thema anlegen.
          </div>
        )}

        {/* Fach + Thema: bestimmen, wo die Frage im Wissens-Wiki einsortiert
            ist und in welchem Einstufungstest/Themen-Test sie auftauchen kann. */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="subject" className="label">
              Fach
            </label>
            <select
              id="subject"
              className="input"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="topic" className="label">
              Thema
            </label>
            <select
              id="topic"
              className="input"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              disabled={isLoadingTopics || topics.length === 0}
            >
              {topics.length === 0 && <option>Keine Themen vorhanden</option>}
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t._count.questions} Fragen)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="prompt" className="label">
            Frage
          </label>
          <textarea
            id="prompt"
            required
            rows={2}
            className="input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div>
          <span className="label">Antwortmöglichkeiten (genau eine richtig)</span>
          <div className="space-y-2">
            {answers.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={a.isCorrect}
                  onChange={() => setCorrect(i)}
                  className="accent-primary shrink-0"
                  aria-label={`Antwort ${i + 1} als richtig markieren`}
                />
                <input
                  required
                  className="input"
                  placeholder={`Antwort ${i + 1}`}
                  value={a.text}
                  onChange={(e) => updateAnswer(i, { text: e.target.value })}
                />
                {answers.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeAnswer(i)}
                    className="btn-ghost !px-2"
                    aria-label="Antwort entfernen"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addAnswer} className="btn-ghost mt-2 !px-2 text-sm">
            <PlusCircle size={14} /> Antwort hinzufügen
          </button>
        </div>

        <div>
          <label htmlFor="explanation" className="label">
            Erklärung zur richtigen Lösung
          </label>
          <textarea
            id="explanation"
            required
            rows={2}
            className="input"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="difficulty" className="label">
              Schwierigkeitsgrad
            </label>
            <select
              id="difficulty"
              className="input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="EASY">Leicht</option>
              <option value="MEDIUM">Mittel</option>
              <option value="HARD">Schwer</option>
            </select>
          </div>
          <div>
            <label htmlFor="usage" className="label">
              Verwendung
            </label>
            <select
              id="usage"
              className="input"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
            >
              <option value="BOTH">Einstufungstest + Themen-Test</option>
              <option value="PLACEMENT">Nur Einstufungstest</option>
              <option value="TOPIC_TEST">Nur Themen-Test</option>
            </select>
            <p className="text-xs text-muted mt-1.5">
              Steuert, in welchem Testtyp diese Frage vorkommen kann.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting || !topicId} className="btn-primary flex-1">
            {isSubmitting ? 'Wird gespeichert…' : 'Frage speichern'}
          </button>
          <button type="button" onClick={() => router.push('/admin')} className="btn-secondary">
            Fertig
          </button>
        </div>
      </form>
    </div>
  );
}
