'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase-client';
import { useAuth } from '@/app/lib/auth-context';
import { ArrowLeft, Save } from 'lucide-react';

const categories = [
  'Research', 'Data Analysis', 'Content Creation', 'Code Generation',
  'Customer Support', 'Automation', 'Education', 'Other',
];

// Bump the last numeric part of a semver-ish string: 1.0.0 -> 1.0.1
function bumpPatch(v: string): string {
  const parts = (v || '1.0.0').split('.');
  const last = parts.length - 1;
  const n = parseInt(parts[last], 10);
  parts[last] = String(Number.isNaN(n) ? 1 : n + 1);
  return parts.join('.');
}

export default function EditAgent() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [gate, setGate] = useState<'' | 'not-found' | 'forbidden'>('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [license, setLicense] = useState('MIT');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [homepageUrl, setHomepageUrl] = useState('');
  const [content, setContent] = useState('');
  const [hasFile, setHasFile] = useState(false);
  const [version, setVersion] = useState('1.0.0');
  const [origContent, setOrigContent] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }

    (async () => {
      const { data: agent } = await supabase.from('agents').select('*').eq('id', id).maybeSingle();
      if (!agent) { setGate('not-found'); setLoading(false); return; }
      if (agent.creator_id !== user.id) { setGate('forbidden'); setLoading(false); return; }

      setTitle(agent.title || '');
      setDescription(agent.description || '');
      setCategory(Array.isArray(agent.category) ? agent.category[0] || '' : '');
      setTags((agent.tags || []).join(', '));
      setLicense(agent.license || 'MIT');
      setRepositoryUrl(agent.repository_url || '');
      setHomepageUrl(agent.homepage_url || '');
      setVersion(agent.version || '1.0.0');

      const { data: file } = await supabase
        .from('agent_files').select('id, file_content')
        .eq('agent_id', id).eq('file_type', 'claude_md').maybeSingle();
      if (file) {
        setHasFile(true);
        setContent(file.file_content || '');
        setOrigContent(file.file_content || '');
      }

      setLoading(false);
    })();
  }, [id, user, authLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // If the agent's instructions changed, bump the patch version.
      const contentChanged = content.trim() !== origContent.trim();
      const newVersion = contentChanged ? bumpPatch(version) : version;

      const { error: agentError } = await supabase
        .from('agents')
        .update({
          title: title.trim(),
          description: description.trim(),
          category: category ? [category] : [],
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          license,
          version: newVersion,
          repository_url: repositoryUrl.trim() || null,
          homepage_url: homepageUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (agentError) throw agentError;
      setVersion(newVersion);

      if (content.trim()) {
        // agent_files has no UPDATE policy for owners (update is a silent no-op),
        // but DELETE + INSERT are allowed — so replace the claude.md row.
        if (hasFile) {
          await supabase.from('agent_files').delete().eq('agent_id', id).eq('file_type', 'claude_md');
        }
        const { error: fe } = await supabase.from('agent_files').insert({
          agent_id: id, file_url: `agent-${id}-claude.md`, file_type: 'claude_md',
          file_name: 'claude.md', file_content: content,
        });
        if (fe) throw fe;
        setHasFile(true);
      }

      router.push(`/agents/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading…</div>
      </div>
    );
  }

  if (gate) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate-300">
          {gate === 'not-found' ? 'This agent does not exist.' : "You can only edit agents you've created."}
        </p>
        <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-semibold">Back to dashboard</Link>
      </div>
    );
  }

  const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-semibold text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">
        <h1 className="text-4xl font-bold text-white mb-2">Edit Agent</h1>
        <p className="text-lg text-slate-400 mb-10">Update your agent's details and instructions.</p>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Agent Name *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required className={inputCls}>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma-separated" className={inputCls} />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-300 mb-2">
              <span>claude.md content {content || hasFile ? '' : '(none yet — add it here)'}</span>
              <span className="text-xs text-slate-500 font-normal">
                v{version} · changing the content bumps to v{bumpPatch(version)}
              </span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              spellCheck={false}
              className={`${inputCls} font-mono text-sm resize-y`}
              placeholder="# My Agent&#10;&#10;## Purpose&#10;..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Repository URL</label>
              <input type="url" value={repositoryUrl} onChange={(e) => setRepositoryUrl(e.target.value)} placeholder="https://github.com/…" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Homepage / Demo URL</label>
              <input type="url" value={homepageUrl} onChange={(e) => setHomepageUrl(e.target.value)} placeholder="https://…" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">License</label>
            <select value={license} onChange={(e) => setLicense(e.target.value)} className={inputCls}>
              <option>MIT</option>
              <option>Apache 2.0</option>
              <option>GPL 3.0</option>
              <option>BSD 3-Clause</option>
              <option>Proprietary</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 flex items-center gap-2">
              <Save className="w-5 h-5" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <Link href={`/agents/${id}`} className="text-slate-400 hover:text-white text-sm">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
