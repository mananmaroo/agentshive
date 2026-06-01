'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/auth-context';
import { supabase } from '@/app/lib/supabase-client';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        setUsername(user.username || '');
        setBio(user.bio || '');
        setEmail(user.email || '');
        setPageLoading(false);
      }
    }
  }, [user, authLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!username.trim()) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      if (username.trim().length < 3) {
        setError('Username must be at least 3 characters');
        setLoading(false);
        return;
      }

      if (username.trim().length > 30) {
        setError('Username must be 30 characters or less');
        setLoading(false);
        return;
      }

      // Check if username is available (if changed)
      if (username.trim() !== user?.username) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', username.trim())
          .single();

        if (existingUser) {
          setError('This username is already taken');
          setLoading(false);
          return;
        }
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: username.trim(),
          bio: bio.trim() || null,
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-500 hover:text-blue-400">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold text-white">Profile Settings</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>

            {error && (
              <div className="flex items-center gap-3 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg mb-6">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose your unique username"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  3-30 characters. Can include letters, numbers, and underscores.
                </p>
                <div className="mt-2 text-xs text-slate-400">
                  Your profile URL: <span className="text-blue-400 font-mono">agentstack.dev/@{username || 'username'}</span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself. What do you build? What are your interests?"
                  maxLength={160}
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {bio.length}/160 characters
                </p>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Username Ideas */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-white mb-4">💡 Need Username Inspiration?</h3>
            <p className="text-slate-300 mb-4">
              Here are some fun ideas:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'magicunicorn',
                'pizzawhisperer',
                'ninjasquirrel',
                'rocketpenguin',
                'thunderlama',
                'ghostpanda',
                'sillyoctopus',
                'cozykoala',
                'zappyzebra',
                'luminouslion',
                'wanderingwhale',
                'daring_dragon',
              ].map((name) => (
                <button
                  key={name}
                  onClick={() => setUsername(name)}
                  className="text-left p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-blue-500 transition text-slate-300 hover:text-blue-400"
                >
                  @{name}
                </button>
              ))}
            </div>
          </div>

          {/* Account Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
              <p className="text-2xl font-bold text-blue-500 mb-2">0</p>
              <p className="text-sm text-slate-400">Agents Created</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
              <p className="text-2xl font-bold text-blue-500 mb-2">0</p>
              <p className="text-sm text-slate-400">Agents Downloaded</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
              <p className="text-2xl font-bold text-blue-500 mb-2">0</p>
              <p className="text-sm text-slate-400">Agents Rated</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/agents/upload" className="block text-blue-500 hover:text-blue-400">
                → Upload Your First Agent
              </Link>
              <Link href="/learn" className="block text-blue-500 hover:text-blue-400">
                → Learn How to Build Agents
              </Link>
              <Link href="/agents" className="block text-blue-500 hover:text-blue-400">
                → Browse Community Agents
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>Agentshive — Build and Share AI Agents</p>
        </div>
      </footer>
    </div>
  );
}
