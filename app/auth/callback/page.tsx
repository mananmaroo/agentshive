'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase-client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace(`/auth/login?message=${encodeURIComponent(error.message)}`);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login?message=Sign-in failed');
        return;
      }

      const stored = localStorage.getItem('post_auth_redirect');

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existing) {
        const meta = user.user_metadata || {};
        const username =
          meta.user_name ||
          meta.preferred_username ||
          meta.name ||
          (user.email ? user.email.split('@')[0] : `user_${user.id.slice(0, 8)}`);

        await supabase.from('users').insert({
          id: user.id,
          username,
          email: user.email,
          avatar_url: meta.avatar_url ?? null,
          github_username: meta.user_name ?? null,
        });

        localStorage.removeItem('post_auth_redirect');
        // Business OAuth must return to the business router even on first sign-in.
        router.replace(stored === '/employees/login' ? stored : '/profile');
        return;
      }

      localStorage.removeItem('post_auth_redirect');
      router.replace(stored && stored.startsWith('/') ? stored : '/');
    };
    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300">
      Signing you in…
    </div>
  );
}
