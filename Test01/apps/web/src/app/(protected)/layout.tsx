'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { SiteHeader } from '@/components/site-header';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, loadProfile } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
          role="status"
          aria-label="Wird geladen"
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
