'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calculator, BookOpen, Globe, ArrowRight, LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import type { Subject } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  calculator: Calculator,
  'book-open': BookOpen,
  globe: Globe,
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<Subject[]>('/subjects')
      .then(setSubjects)
      .catch((err) => console.error('Fehler beim Laden der Fächer:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-2xl font-semibold mb-1 text-ink dark:text-ink-dark">
        Fach auswählen
      </h1>
      <p className="text-muted mb-8">
        Wähle ein Fach, um deinen Einstufungstest zu starten oder weiterzulernen.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const Icon = ICONS[subject.icon ?? ''] ?? BookOpen;
            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.slug}`}
                className="card p-6 flex flex-col gap-4 hover:shadow-card-hover transition-shadow group"
              >
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${subject.colorHex}1A` }}
                >
                  <Icon size={22} style={{ color: subject.colorHex }} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
                    {subject.name}
                  </h2>
                  <p className="text-sm text-muted mt-1">{subject.description}</p>
                </div>
                <span className="text-sm font-medium text-primary flex items-center gap-1 mt-auto">
                  Öffnen
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}