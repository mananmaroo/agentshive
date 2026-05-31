'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { Mail, Lock, Code } from 'lucide-react';
import { supabase } from '@/app/lib/supabase-client';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) {
      setMessage(msg);
    }
  }, [searchParams]);

  const handleOAuth = async (provider: 'github' | 'google' | 'apple' | 'linkedin_oidc') => {
    setError('');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) setError(oauthError.message);
  };

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              AS
            </div>
            <span className="text-2xl font-bold text-white">AgentStack</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Log in to your AgentStack account</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogIn} className="space-y-4 mb-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-blue-500 hover:text-blue-400">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 border-t border-slate-700"></div>
          <span className="text-slate-400 text-sm">or</span>
          <div className="flex-1 border-t border-slate-700"></div>
        </div>

        {/* GitHub Login */}
        <div className="space-y-2">
          <button onClick={() => handleOAuth('github')} type="button" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 border border-slate-700">
            <Code className="w-5 h-5" />
            Log in with GitHub
          </button>
          <button onClick={() => handleOAuth('google')} type="button" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 border border-slate-700">
            Log in with Google
          </button>
          <button onClick={() => handleOAuth('apple')} type="button" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 border border-slate-700">
            Log in with Apple
          </button>
          <button onClick={() => handleOAuth('linkedin_oidc')} type="button" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 border border-slate-700">
            Log in with LinkedIn
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-500 hover:text-blue-400 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LogIn() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
