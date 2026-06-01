'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/app/lib/supabase-client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) throw resetError;

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
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
              A
            </div>
            <span className="text-2xl font-bold text-white">Agentshive</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400">Enter your email to receive reset instructions</p>
        </div>

        {!submitted ? (
          <>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                We'll send you a link to reset your password
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            </form>
          </>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
            <p className="text-green-400 font-semibold mb-2">✓ Check your email</p>
            <p className="text-slate-300 text-sm mb-4">
              We've sent a password reset link to <span className="font-semibold">{email}</span>.
              Check your inbox and follow the instructions to reset your password.
            </p>
            <p className="text-xs text-slate-500">
              Didn't receive it? Check your spam folder or try again with a different email.
            </p>
          </div>
        )}

        {/* Back to Login */}
        <div className="text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
