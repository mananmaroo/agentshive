'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpenCheck, Building2, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase-client';
import { useAuth } from '@/app/lib/auth-context';

export default function BusinessLoginPage() {
  const { user, loading: checkingSession } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!checkingSession && user) router.replace('/employees/setup');
  }, [checkingSession, router, user]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }
    router.replace('/employees/setup');
  };

  const signInWithGoogle = async () => {
    setError('');
    localStorage.setItem('post_auth_redirect', '/employees/setup');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) setError(oauthError.message);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#064e3b_0%,#020617_52%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          <ArrowLeft className="h-4 w-4" /> Back to AgentsHive Business
        </Link>

        <div className="mt-10 grid overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl lg:grid-cols-2">
          <section className="border-b border-slate-800 p-8 sm:p-12 lg:border-b-0 lg:border-r">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              <Building2 className="h-4 w-4" /> Business portal
            </div>
            <h1 className="mt-7 text-4xl font-bold leading-tight">Sign in to manage your AI employees.</h1>
            <p className="mt-5 max-w-lg leading-7 text-slate-400">
              This portal is for coaching institutes and business customers. Community agent publishing remains in the separate AgentsHive account experience.
            </p>
            <div className="mt-9 space-y-4">
              {[
                [BookOpenCheck, 'Approve website knowledge before Aarya uses it'],
                [ShieldCheck, 'Control languages, dialects and human escalation'],
                [Lock, 'Keep each institute’s information private'],
              ].map(([Icon, text]) => {
                const ItemIcon = Icon as typeof ShieldCheck;
                return <div key={text as string} className="flex items-center gap-3 text-sm text-slate-300"><ItemIcon className="h-5 w-5 text-emerald-400" />{text as string}</div>;
              })}
            </div>
          </section>

          <section className="p-8 sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Institute access</p>
            <h2 className="mt-2 text-2xl font-bold">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Use the account approved for your business pilot.</p>

            {error && <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

            <form onSubmit={signIn} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold text-slate-300">Business email
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@institute.edu" className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none focus:border-emerald-500" />
                </div>
              </label>
              <label className="block text-sm font-semibold text-slate-300">Password
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none focus:border-emerald-500" />
                </div>
              </label>
              <button disabled={submitting || checkingSession} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold hover:bg-emerald-500 disabled:opacity-60">
                {(submitting || checkingSession) && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Signing in…' : 'Sign in to Business'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4"><span className="h-px flex-1 bg-slate-800" /><span className="text-xs text-slate-600">or</span><span className="h-px flex-1 bg-slate-800" /></div>
            <button type="button" onClick={signInWithGoogle} className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 font-semibold text-slate-200 hover:border-emerald-500">Continue with Google</button>

            <p className="mt-7 text-center text-sm text-slate-500">
              Need a pilot account? <a href="mailto:hello@agentshive.net?subject=AgentsHive%20Business%20pilot%20access" className="font-semibold text-emerald-300 hover:text-emerald-200">Request access</a>
            </p>
            <p className="mt-4 text-center text-xs text-slate-600">Community member? <Link href="/auth/login" className="text-indigo-300 hover:text-indigo-200">Use the Agents login</Link></p>
          </section>
        </div>
      </div>
    </main>
  );
}
