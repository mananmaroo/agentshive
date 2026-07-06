'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/auth-context';
import { supabase } from '@/app/lib/supabase-client';
import { BADGES, sortBadges, BadgeChip, isBadgeId, type BadgeId } from '@/app/lib/badges';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Upload,
  Link2,
  Pencil,
} from 'lucide-react';

type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type Interest = 'building' | 'browsing' | 'learning' | 'sharing';

const LEVELS: { value: Level; label: string; hint: string }[] = [
  { value: 'beginner', label: 'Just starting', hint: 'New to AI agents' },
  { value: 'intermediate', label: 'Comfortable', hint: 'Built a few agents' },
  { value: 'advanced', label: 'Advanced', hint: 'Ship agents regularly' },
  { value: 'expert', label: 'Expert', hint: 'This is my craft' },
];

const INTERESTS: { value: Interest; label: string }[] = [
  { value: 'building', label: '🛠️ Building agents' },
  { value: 'browsing', label: '🔎 Finding agents to use' },
  { value: 'learning', label: '📚 Learning how' },
  { value: 'sharing', label: '📣 Sharing my work' },
];

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Profile() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [level, setLevel] = useState<Level | ''>('');
  const [interest, setInterest] = useState<Interest | ''>('');
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  const [stats, setStats] = useState({ agents: 0, totalDownloads: 0 });

  const needsOnboarding = !user?.onboarded_at;

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [editingAnswers, setEditingAnswers] = useState(false);
  const levelLabel = LEVELS.find((l) => l.value === level)?.label;
  const interestLabel = INTERESTS.find((i) => i.value === interest)?.label;
  const ownedBadges = sortBadges(user?.badges || []);
  const newBadges = (user?.badges || []).filter(
    (b) => isBadgeId(b) && !(user?.badges_acknowledged || []).includes(b)
  ) as BadgeId[];
  const showBadgeBanner = !bannerDismissed && newBadges.length > 0;

  const acknowledgeBadges = async () => {
    setBannerDismissed(true);
    if (!user) return;
    await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
      body: JSON.stringify({ badges_acknowledged: user.badges }),
    });
  };

  const loadStats = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`);
      const json = await res.json();
      if (json?.data?.stats) setStats(json.data.stats);
    } catch {
      /* non-critical */
    }
  }, []);

  // Sync a freshly-linked GitHub identity into users.github_username.
  const syncGithubIdentity = useCallback(async (id: string, current: string | null) => {
    if (current) return;
    const { data } = await supabase.auth.getUserIdentities();
    const gh = data?.identities?.find((i) => i.provider === 'github');
    const ghName = (gh?.identity_data?.user_name || gh?.identity_data?.preferred_username) as
      | string
      | undefined;
    if (ghName) {
      await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
        body: JSON.stringify({ github_username: ghName }),
      });
      setGithubUsername(ghName);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUsername(user.username || '');
    setBio(user.bio || '');
    setEmail(user.email || '');
    setAvatarUrl(user.avatar_url || null);
    setLevel((user.experience_level as Level) || '');
    setInterest((user.primary_interest as Interest) || '');
    setGithubUsername(user.github_username || null);
    setPageLoading(false);
    loadStats(user.id);
    syncGithubIdentity(user.id, user.github_username || null);
  }, [user, authLoading, router, loadStats, syncGithubIdentity]);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/avatar', {
        method: 'POST',
        headers: { ...(await authHeader()) },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setAvatarUrl(json.data.avatar_url);
      setSuccess('Avatar updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleConnectGithub = async () => {
    setLinking(true);
    setError('');
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (linkError) {
      setError(linkError.message);
      setLinking(false);
    }
    // On success the browser redirects to GitHub, then back here.
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const name = username.trim();
      if (name.length < 3 || name.length > 30) {
        setError('Username must be 3-30 characters');
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
        body: JSON.stringify({
          username: name,
          bio: bio.trim() || null,
          experience_level: level || undefined,
          primary_interest: interest || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update profile');
      setEditingAnswers(false);
      setSuccess('Profile saved!');
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

  const initial = (username || email || '?').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {showBadgeBanner && (
            <div className="bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/40 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-semibold mb-1">
                    🎉 You&apos;ve been given {newBadges.length > 1 ? 'badges' : 'a badge'}!
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {newBadges.map((b) => (
                      <BadgeChip key={b} id={b} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 mt-3">
                    {newBadges.map((b) => BADGES[b].description).join(' ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={acknowledgeBadges}
                  className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {needsOnboarding && (
            <div className="bg-blue-500/10 border border-blue-500/40 text-blue-200 rounded-lg p-5">
              👋 Welcome! Take 20 seconds to set up your profile — add an avatar and
              tell us where you&apos;re at with agents so we can tailor what you see.
            </div>
          )}

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

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleAvatar}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Change avatar'}
                </button>
                <p className="text-xs text-slate-500 mt-2">PNG, JPEG, WEBP or GIF, up to 2MB.</p>
                {ownedBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {ownedBadges.map((b) => (
                      <BadgeChip key={b} id={b} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose your unique username"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
                <div className="mt-2 text-xs text-slate-400">
                  Your public profile:{' '}
                  <Link href={`/creators/${user?.id}`} className="text-blue-400 hover:text-blue-300 underline">
                    View public page →
                  </Link>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself. What do you build?"
                  maxLength={160}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{bio.length}/160 characters</p>
              </div>

              {level && interest && !editingAnswers ? (
                /* Collapsed summary once answered */
                <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-300">
                        <span className="text-slate-500">Agent knowledge:</span>{' '}
                        <span className="text-white font-medium">{levelLabel}</span>
                      </p>
                      <p className="text-slate-300">
                        <span className="text-slate-500">Here to:</span>{' '}
                        <span className="text-white font-medium">{interestLabel}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingAnswers(true)}
                      className="shrink-0 flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    These answers just personalize what you see — editing them won&apos;t affect
                    any badges you&apos;ve earned (badges come from your activity, not this).
                  </p>
                </div>
              ) : (
                <>
                  {/* Experience level */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      How much do you know about AI agents?
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {LEVELS.map((l) => (
                        <button
                          type="button"
                          key={l.value}
                          onClick={() => setLevel(l.value)}
                          className={`text-left p-3 rounded-lg border transition ${
                            level === l.value
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
                          }`}
                        >
                          <div className="text-white text-sm font-medium">{l.label}</div>
                          <div className="text-xs text-slate-400">{l.hint}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary interest */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      What brings you here?
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {INTERESTS.map((i) => (
                        <button
                          type="button"
                          key={i.value}
                          onClick={() => setInterest(i.value)}
                          className={`text-left p-3 rounded-lg border transition text-sm ${
                            interest === i.value
                              ? 'border-blue-500 bg-blue-500/10 text-white'
                              : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 text-slate-300'
                          }`}
                        >
                          {i.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

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

          {/* Connected accounts */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Connected accounts</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link2 className="w-6 h-6 text-slate-300" />
                <div>
                  <p className="text-white text-sm font-medium">GitHub</p>
                  <p className="text-xs text-slate-400">
                    {githubUsername
                      ? `Connected as @${githubUsername}`
                      : 'Link GitHub to your account'}
                  </p>
                </div>
              </div>
              {githubUsername ? (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" /> Connected
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGithub}
                  disabled={linking}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
                >
                  {linking ? 'Connecting...' : 'Connect GitHub'}
                </button>
              )}
            </div>
          </div>

          {/* Live stats */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
              <p className="text-2xl font-bold text-blue-500 mb-2">{stats.agents}</p>
              <p className="text-sm text-slate-400">Agents Created</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
              <p className="text-2xl font-bold text-blue-500 mb-2">{stats.totalDownloads}</p>
              <p className="text-sm text-slate-400">Total Downloads</p>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/agents/upload" className="block text-blue-500 hover:text-blue-400">
                → Upload Your First Agent
              </Link>
              <Link href="/agents" className="block text-blue-500 hover:text-blue-400">
                → Browse Community Agents
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>Agentshive — Build and Share AI Agents</p>
        </div>
      </footer>
    </div>
  );
}
