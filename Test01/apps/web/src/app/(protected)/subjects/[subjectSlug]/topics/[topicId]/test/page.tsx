'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { QuizRunner } from '@/components/test/quiz-runner';
import type { TestAttempt } from '@/types';

export default function TopicTestPage() {
  const params = useParams<{ subjectSlug: string; topicId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!attemptId) return;
    api.get<TestAttempt>(`/topics/${params.topicId}/test/${attemptId}`).then(setAttempt);
  }, [attemptId, params.topicId]);

  async function handleSubmit(
    answers: { questionId: string; selectedAnswerId: string | null }[],
  ) {
    if (!attemptId) return;
    setIsSubmitting(true);
    try {
      await api.post(`/topics/${params.topicId}/test/${attemptId}/submit`, { answers });
      router.push(
        `/subjects/${params.subjectSlug}/topics/${params.topicId}/test/${attemptId}/result`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!attempt) return <div className="h-96 max-w-2xl mx-auto card animate-pulse" />;

  return <QuizRunner attempt={attempt} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
}
