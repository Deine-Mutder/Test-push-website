'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, PenSquare } from 'lucide-react';
import { api } from '@/lib/api';

interface SubTopicListItem {
  id: string;
  slug: string;
  name: string;
}

export default function TopicWikiPage() {
  const params = useParams<{ subjectSlug: string; topicId: string }>();
  const router = useRouter();
  const [data, setData] = useState<{
    topic: { name: string };
    subTopics: SubTopicListItem[];
  } | null>(null);
  const [isStartingTest, setIsStartingTest] = useState(false);

  useEffect(() => {
    api
      .get<{ topic: { name: string }; subTopics: SubTopicListItem[] }>(
        `/subjects/${params.subjectSlug}/topics/${params.topicId}/wiki`,
      )
      .then(setData);
  }, [params.subjectSlug, params.topicId]);

  async function startTopicTest() {
    setIsStartingTest(true);
    try {
      const attempt = await api.post<{ id: string }>(`/topics/${params.topicId}/test/start`);
      router.push(
        `/subjects/${params.subjectSlug}/topics/${params.topicId}/test?attemptId=${attempt.id}`,
      );
    } finally {
      setIsStartingTest(false);
    }
  }

  if (!data) return <div className="h-64 card animate-pulse" />;

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
          {data.topic.name}
        </h1>
        <button onClick={startTopicTest} disabled={isStartingTest} className="btn-primary">
          <PenSquare size={16} />
          {isStartingTest ? 'Wird vorbereitet…' : 'Themen-Test starten'}
        </button>
      </div>

      {data.subTopics.length === 0 ? (
        <p className="text-sm text-muted">
          Für dieses Thema werden die Wiki-Inhalte gerade noch vorbereitet.
        </p>
      ) : (
        <div className="grid gap-3">
          {data.subTopics.map((st) => (
            <Link
              key={st.id}
              href={`/subjects/${params.subjectSlug}/topics/${params.topicId}/wiki/${st.slug}`}
              className="card p-4 flex items-center justify-between hover:shadow-card-hover transition-shadow"
            >
              <span className="font-medium text-sm text-ink dark:text-ink-dark">{st.name}</span>
              <ArrowRight size={16} className="text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
