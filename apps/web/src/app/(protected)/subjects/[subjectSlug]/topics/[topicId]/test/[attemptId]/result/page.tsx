'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { TestResultView } from '@/components/test/test-result-view';
import type { TestResult } from '@/types';

export default function TopicTestResultPage() {
  const params = useParams<{ subjectSlug: string; topicId: string; attemptId: string }>();
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    api
      .get<TestResult>(`/topics/${params.topicId}/test/${params.attemptId}/result`)
      .then(setResult);
  }, [params.topicId, params.attemptId]);

  if (!result) return <div className="h-96 max-w-2xl mx-auto card animate-pulse" />;

  return (
    <div>
      <TestResultView result={result} />
      <div className="max-w-2xl mx-auto mt-6 text-center">
        <Link href={`/subjects/${params.subjectSlug}`} className="btn-primary">
          Zurück zum Wissens-Wiki
        </Link>
      </div>
    </div>
  );
}
