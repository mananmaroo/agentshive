'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase-client';

export default function AuthCallback() {
  const router = useRouter();
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const run = async () => {
      const stored = localStorage.getItem('post_auth_redirect');
      const isBusinessLogin = stored === '/employees/login';
      const errorDestination = isBusinessLogin ? '/employees/login' : '/auth/login';
      const code = new URLSearchParams(window.location.search).get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          // Supabase's browser client may already have consumed the URL code.
          // Continue only when the server-backed auth check confirms a real session.
          const { data: { user: existingSessionUser } } = await supabase.auth.getUser();
          if (!existingSessionUser) {
            router.replace(`${errorDestination}?message=${encodeURIComponent(error.message)}`);
            return;
          }
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`${errorDestination}?message=${encodeURIComponent('Sign-in failed')}`);
        return;
      }

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
        router.replace(isBusinessLogin ? '/employees/login' : '/profile');
        return;
      }

      localStorage.removeItem('post_auth_redirect');
      router.replace(isBusinessLogin ? '/employees/login' : '/');
    };

    void run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300">
      Signing you in…
    </div>
  );
}
