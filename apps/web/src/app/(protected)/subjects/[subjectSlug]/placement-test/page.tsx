'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { QuizRunner } from '@/components/test/quiz-runner';
import type { TestAttempt } from '@/types';

export default function PlacementTestPage() {
  const params = useParams<{ subjectSlug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!attemptId) return;
    api
      .get<TestAttempt>(`/subjects/${params.subjectSlug}/placement-test/${attemptId}`)
      .then(setAttempt);
  }, [attemptId, params.subjectSlug]);

  async function handleSubmit(
    answers: { questionId: string; selectedAnswerId: string | null }[],
  ) {
    if (!attemptId) return;
    setIsSubmitting(true);
    try {
      await api.post(
        `/subjects/${params.subjectSlug}/placement-test/${attemptId}/submit`,
        { answers },
      );
      router.push(`/subjects/${params.subjectSlug}/placement-test/${attemptId}/result`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!attempt) {
    return <div className="h-96 max-w-2xl mx-auto card animate-pulse" />;
  }

  return <QuizRunner attempt={attempt} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
}
