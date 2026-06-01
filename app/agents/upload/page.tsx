'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Upload, FileText, Code, Video, BarChart3, ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';

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
  const [agentName, setAgentName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [uploadFormat, setUploadFormat] = useState('claude-md');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement file upload to Supabase
    setTimeout(() => setLoading(false), 1500);
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
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
            ) : (
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer bg-slate-800/50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Drop your file here</p>
                <p className="text-sm text-slate-400 mb-4">or click to browse</p>
                <input
                  type="file"
                  className="hidden"
                  required
                  accept={
                    uploadFormat === 'code' ? '.py,.js,.ts' : uploadFormat === 'n8n' ? '.json' : '.txt,.md'
                  }
                />
                <p className="text-xs text-slate-500">
                  {uploadFormat === 'code' && 'Accepted: .py, .js, .ts'}
                  {uploadFormat === 'n8n' && 'Accepted: .json'}
                  {uploadFormat === 'claude-md' && 'Accepted: .md, .txt'}
                </p>
              </div>
            )}
          </div>

          {/* Repository & Homepage URLs (Optional) */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Repository URL</label>
              <input
                type="url"
                placeholder="https://github.com/username/repo"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Homepage / Demo URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* License */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">License</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
              <option>MIT</option>
              <option>Apache 2.0</option>
              <option>GPL 3.0</option>
              <option>BSD 3-Clause</option>
              <option>Proprietary</option>
            </select>
          </div>

          {/* Terms */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-slate-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">
                I confirm that this agent doesn't contain malicious code and I have the right to share it.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
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
