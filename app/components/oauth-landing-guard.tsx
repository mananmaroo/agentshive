'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function OAuthLandingGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) return;
    const safeCode = encodeURIComponent(code);
    router.replace(`/auth/callback?code=${safeCode}`);
  }, [code, router]);

  if (code) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-300">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" aria-label="Completing secure sign-in" />
          <p className="mt-3 text-sm">Completing secure sign-in…</p>
        </div>
      </main>
    );
  }

  return children;
}
