'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Code, Video, BarChart3, ArrowLeft, BookOpen, ExternalLink, ClipboardType, Link2 } from 'lucide-react';
import { supabase } from '@/app/lib/supabase-client';
import { useAuth } from '@/app/lib/auth-context';

const recommendedReading = [
  {
    title: 'Building effective agents',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/engineering/building-effective-agents',
    note: 'Start here. Decide whether you actually need an agent or a workflow.',
  },
  {
    title: 'Writing effective tools for agents',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/engineering/writing-tools-for-agents',
    note: 'How to design the tools your agent calls — naming, descriptions, token cost.',
  },
  {
    title: 'Effective context engineering for AI agents',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
    note: 'Just-in-time retrieval, compaction, and structured note-taking patterns.',
  },
  {
    title: 'Prompt engineering for Claude',
    source: 'Anthropic Docs',
    url: 'https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/overview',
    note: 'Canonical reference for system prompts that work with agentic workflows.',
  },
  {
    title: 'LLM Evals: everything you need to know',
    source: 'Hamel Husain & Shreya Shankar',
    url: 'https://hamel.dev/blog/posts/evals-faq/',
    note: "Don't publish an agent you haven't evaluated. This is the eval playbook.",
  },
];

export default function UploadAgent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [agentName, setAgentName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [uploadFormat, setUploadFormat] = useState('claude-md');
  const [inputMethod, setInputMethod] = useState<'file' | 'paste' | 'github'>('file');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [version, setVersion] = useState('1.0.0');
  const [videoUrl, setVideoUrl] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [homepageUrl, setHomepageUrl] = useState('');
  const [license, setLicense] = useState('MIT');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setFileContent(await file.text());
  };

  const importFromGithub = async () => {
    const url = githubUrl.trim();
    if (!url) {
      setError('Paste a link to a file in your GitHub repo.');
      return;
    }
    // Convert a normal GitHub file page URL to its raw form.
    //   https://github.com/user/repo/blob/main/agent.md
    //   -> https://raw.githubusercontent.com/user/repo/main/agent.md
    const rawUrl = url
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/');
    setGithubLoading(true);
    setError('');
    try {
      const res = await fetch(rawUrl);
      if (!res.ok) {
        throw new Error(
          'Could not fetch that file. Make sure it links to a single file in a public repo.'
        );
      }
      const text = await res.text();
      if (!text.trim()) throw new Error('That file appears to be empty.');
      setFileContent(text);
      setFileName(rawUrl.split('/').pop() || 'claude.md');
    } catch (err: any) {
      setError(err.message || 'Failed to import from GitHub.');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Please log in to upload an agent.');
      return;
    }
    if (!terms) {
      setError('Please confirm the agent is safe and yours to share.');
      return;
    }
    const isVideo = uploadFormat === 'video';
    if (isVideo && !videoUrl.trim()) {
      setError('Please provide a video URL.');
      return;
    }
    if (!isVideo && !fileContent.trim()) {
      setError('Please choose a file to upload.');
      return;
    }

    setLoading(true);
    try {
      // The supabase-js query builder has been hanging on its internal token
      // handling, while raw PostgREST responds instantly. So we talk to
      // PostgREST directly with the user's access token.
      const { data: sd } = await supabase.auth.getSession();
      const token = sd.session?.access_token;
      if (!token) throw new Error('Your session expired. Please log out and back in.');

      const restUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      const headers = {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const rest = async (path: string, body: unknown, returnRow: boolean) => {
        const res = await fetch(`${restUrl}/rest/v1/${path}`, {
          method: 'POST',
          headers: returnRow ? { ...headers, Prefer: 'return=representation' } : headers,
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(20000),
        });
        const text = await res.text();
        if (!res.ok) {
          let msg = text;
          try { msg = JSON.parse(text).message || text; } catch {}
          throw new Error(msg || `Request failed (${res.status})`);
        }
        return text ? JSON.parse(text) : null;
      };

      const inserted = await rest(
        'agents',
        {
          title: agentName.trim(),
          description: description.trim(),
          category: [category],
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          creator_id: user.id,
          license,
          version: version.trim() || '1.0.0',
          repository_url: repositoryUrl.trim() || null,
          homepage_url: homepageUrl.trim() || null,
          downloads_count: 0,
          views_count: 0,
          average_rating: 0,
          rating_count: 0,
          verified: false,
          featured: false,
        },
        true
      );
      const agent = Array.isArray(inserted) ? inserted[0] : inserted;

      const fileRow = isVideo
        ? { agent_id: agent.id, file_url: videoUrl.trim(), file_type: 'video_url', file_name: 'demo-video' }
        : {
            agent_id: agent.id,
            file_url: `agent-${agent.id}-claude.md`,
            file_type: 'claude_md',
            file_name: fileName || 'claude.md',
            file_content: fileContent,
          };
      await rest('agent_files', fileRow, false);

      router.push(`/agents/${agent.id}`);
    } catch (err: any) {
      console.error('Upload failed:', err);
      const detail = err?.message || err?.error_description || err?.hint || JSON.stringify(err);
      setError(`Upload failed: ${detail}`);
      setLoading(false);
    }
  };

  const formats = [
    {
      id: 'claude-md',
      name: 'Claude.md',
      description: 'Plain text file with agent instructions',
      icon: FileText,
      color: 'blue',
      recommended: true,
    },
    {
      id: 'code',
      name: 'Code (Python/JS)',
      description: 'Source code with LangChain, Anthropic SDK',
      icon: Code,
      color: 'purple',
      recommended: false,
    },
    {
      id: 'n8n',
      name: 'n8n Workflow',
      description: 'Visual workflow JSON export',
      icon: BarChart3,
      color: 'orange',
      recommended: false,
    },
    {
      id: 'video',
      name: 'Tutorial Video',
      description: 'Link to YouTube or other video platform',
      icon: Video,
      color: 'red',
      recommended: false,
    },
  ];

  const categories = [
    'Research',
    'Data Analysis',
    'Content Creation',
    'Code Generation',
    'Customer Support',
    'Automation',
    'Education',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-900/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <h1 className="text-xl font-bold text-white">Agentshive</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/learn" className="text-slate-300 hover:text-white transition text-sm">
              Learn
            </Link>
            <Link href="/agents" className="text-slate-300 hover:text-white transition text-sm">
              Browse
            </Link>
            <Link href="/auth/signup" className="text-slate-300 hover:text-white transition text-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Back Button */}
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-semibold text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Upload Your Agent</h1>
          <p className="text-lg text-slate-400">
            Share your AI agent with the community. Choose your preferred format.
          </p>
        </div>

        {/* Format Selector */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Choose Format</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {formats.map((format) => {
              const Icon = format.icon;
              const isSelected = uploadFormat === format.id;
              return (
                <button
                  key={format.id}
                  onClick={() => setUploadFormat(format.id)}
                  className={`p-6 rounded-lg border-2 transition text-left ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-6 h-6 text-blue-500" />
                    {format.recommended && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{format.name}</h3>
                  <p className="text-sm text-slate-400">{format.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-6">
          {/* Agent Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Agent Name *</label>
            <input
              type="text"
              placeholder="e.g., Research Assistant, Code Generator"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
            <textarea
              placeholder="Describe what your agent does, its capabilities, and use cases"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
            <input
              type="text"
              placeholder="e.g., ai, research, python, langchain (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Format-Specific Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {uploadFormat === 'claude-md' && 'Upload claude.md File *'}
              {uploadFormat === 'code' && 'Upload Code File *'}
              {uploadFormat === 'n8n' && 'Upload n8n JSON Export *'}
              {uploadFormat === 'video' && 'Video URL *'}
            </label>

            {uploadFormat === 'video' ? (
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <>
                {/* Input-method tabs */}
                <div className="flex gap-2 mb-4">
                  {[
                    { id: 'file', label: 'Upload file', icon: Upload },
                    { id: 'paste', label: 'Paste text', icon: ClipboardType },
                    { id: 'github', label: 'From GitHub', icon: Link2 },
                  ].map((m) => {
                    const MIcon = m.icon;
                    const active = inputMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setInputMethod(m.id as 'file' | 'paste' | 'github')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        <MIcon className="w-4 h-4" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                {inputMethod === 'file' && (
                  <label
                    htmlFor="agent-file"
                    className="block border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer bg-slate-800/50"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-white font-semibold mb-1">
                      {fileName ? fileName : 'Drop your file here'}
                    </p>
                    <p className="text-sm text-slate-400 mb-4">
                      {fileName ? 'Click to choose a different file' : 'or click to browse'}
                    </p>
                    <input
                      id="agent-file"
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                      accept={
                        uploadFormat === 'code' ? '.py,.js,.ts' : uploadFormat === 'n8n' ? '.json' : '.txt,.md'
                      }
                    />
                    <p className="text-xs text-slate-500">
                      {uploadFormat === 'code' && 'Accepted: .py, .js, .ts'}
                      {uploadFormat === 'n8n' && 'Accepted: .json'}
                      {uploadFormat === 'claude-md' && 'Accepted: .md, .txt (double extensions like .md.txt are fine)'}
                    </p>
                  </label>
                )}

                {inputMethod === 'paste' && (
                  <textarea
                    value={fileContent}
                    onChange={(e) => {
                      setFileContent(e.target.value);
                      if (!fileName) setFileName('claude.md');
                    }}
                    rows={12}
                    placeholder="Paste your agent instructions / CLAUDE.md content here…"
                    className="w-full font-mono text-sm bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-y"
                  />
                )}

                {inputMethod === 'github' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/user/repo/blob/main/agent.md"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={importFromGithub}
                        disabled={githubLoading}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                      >
                        {githubLoading ? 'Fetching…' : 'Fetch file'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Paste the link to a single file in a public repo. We&apos;ll pull its contents in.
                    </p>
                    {fileContent && fileName && (
                      <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Imported {fileName} ({fileContent.length.toLocaleString()} chars)
                      </div>
                    )}
                  </div>
                )}

                {/* Preview when content loaded via file or github */}
                {inputMethod !== 'paste' && fileContent && (
                  <details className="mt-3">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                      Preview loaded content
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 whitespace-pre-wrap">
                      {fileContent.slice(0, 2000)}
                      {fileContent.length > 2000 ? '\n…' : ''}
                    </pre>
                  </details>
                )}
              </>
            )}
          </div>

          {/* Repository & Homepage URLs (Optional) */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Repository URL</label>
              <input
                type="url"
                placeholder="https://github.com/username/repo"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Homepage / Demo URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={homepageUrl}
                onChange={(e) => setHomepageUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* License + Version */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">License</label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option>MIT</option>
                <option>Apache 2.0</option>
                <option>GPL 3.0</option>
                <option>BSD 3-Clause</option>
                <option>Proprietary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Use semantic versioning, e.g. 1.0.0. Bump it when you update the agent.</p>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">
                I confirm that this agent doesn't contain malicious code and I have the right to share it.
              </span>
            </label>
          </div>

          {/* Not-logged-in notice */}
          {!authLoading && !user && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-lg text-sm">
              You need to be logged in to upload.{' '}
              <Link href="/auth/login" className="font-semibold text-amber-300 underline">Log in</Link>{' '}
              or{' '}
              <Link href="/auth/signup" className="font-semibold text-amber-300 underline">create an account</Link>.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || authLoading || !user}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {loading ? 'Uploading...' : 'Upload Agent'}
          </button>
        </form>

        {/* Recommended reading */}
        <div className="mt-16 border border-slate-800 rounded-lg p-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-semibold text-white">Read this before you upload</h3>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            A short reading list from the people who build agents for a living. Twenty minutes here
            will save you hours of debugging later.
          </p>
          <ul className="space-y-4">
            {recommendedReading.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border border-slate-800 hover:border-slate-600 rounded-lg p-4 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-white font-semibold group-hover:text-indigo-400 transition">
                      {r.title}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-indigo-300 mb-1">{r.source}</p>
                  <p className="text-sm text-slate-400">{r.note}</p>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-6">
            More on the <Link href="/blog" className="text-indigo-400 hover:text-indigo-300">curated blog</Link>.
            Best practices for this site: review for safety before publishing, add tags so others can find it,
            include clear examples, and iterate from feedback.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>Agentshive — Share and Discover AI Agents</p>
        </div>
      </footer>
    </div>
  );
}
