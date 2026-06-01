'use client';

import Link from 'next/link';
import { BookOpen, Code, FileText, Video, Users, Zap, ArrowRight, Copy } from 'lucide-react';

export default function Learn() {
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
            <Link href="/learn" className="text-white transition text-sm font-semibold">
              Learn
            </Link>
            <Link href="/agents" className="text-slate-300 hover:text-white transition text-sm">
              Browse
            </Link>
            <Link href="/auth/signup" className="text-slate-300 hover:text-white transition text-sm">
              Sign Up
            </Link>
            <Link href="/agents/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm">
              Upload Agent
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Learn to Build Agents</h1>
          <p className="text-xl text-slate-400">
            Step-by-step guides to create powerful AI agents in multiple formats
          </p>
        </div>

        {/* Quick Start Tabs */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {[
            { icon: FileText, title: 'Claude.md', desc: 'Start with text', color: 'blue' },
            { icon: Code, title: 'Code', desc: 'LangChain/SDK', color: 'purple' },
            { icon: Video, title: 'n8n', desc: 'Visual workflow', color: 'orange' },
            { icon: Video, title: 'Tutorial', desc: 'Video walkthrough', color: 'pink' },
          ].map((format, i) => {
            const Icon = format.icon;
            return (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer group"
              >
                <Icon className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition" />
                <h3 className="text-lg font-semibold text-white mb-1">{format.title}</h3>
                <p className="text-sm text-slate-400">{format.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Claude.md Guide */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-500" />
            Getting Started with Claude.md
          </h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white font-bold">
                    1
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-white mb-3">Create a claude.md File</h3>
                  <p className="text-slate-300 mb-4">
                    The easiest way to build an agent is to create a plain text file with agent instructions.
                  </p>
                  <div className="bg-slate-900 border border-slate-600 rounded p-4 mb-4">
                    <code className="text-sm text-slate-300">
                      <div># My Research Agent</div>
                      <div>## Purpose</div>
                      <div>Analyze research papers and summarize findings.</div>
                      <div><br /></div>
                      <div>## Instructions</div>
                      <div>1. Read the provided paper</div>
                      <div>2. Extract key findings</div>
                      <div>3. Generate executive summary</div>
                    </code>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Structure: title, purpose, instructions, capabilities, examples
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white font-bold">
                    2
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-white mb-3">Define Your Agent's Behavior</h3>
                  <p className="text-slate-300 mb-4">
                    Specify what your agent should do, what information it needs, and how it should respond.
                  </p>
                  <div className="bg-slate-900 border border-slate-600 rounded p-4 mb-4">
                    <div className="text-slate-300 text-sm space-y-2">
                      <div>## Capabilities</div>
                      <div>- Web search and analysis</div>
                      <div>- Document summarization</div>
                      <div>- Code generation</div>
                      <div><br /></div>
                      <div>## Input Format</div>
                      <div>User provides: topic, document link, or code snippet</div>
                      <div><br /></div>
                      <div>## Output Format</div>
                      <div>Structured JSON or markdown response</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white font-bold">
                    3
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-white mb-3">Upload to Agentshive</h3>
                  <p className="text-slate-300 mb-4">
                    Share your agent with the community and enable others to use it instantly.
                  </p>
                  <Link
                    href="/agents/upload"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Start Uploading <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Formats */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">Advanced Formats</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* n8n */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-6 h-6 text-orange-500" />
                <h3 className="text-2xl font-semibold text-white">n8n Workflows</h3>
              </div>
              <p className="text-slate-300 mb-4">
                Build complex automation workflows with visual node-based programming. Perfect for integration-heavy agents.
              </p>
              <ul className="space-y-2 text-slate-400 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">→</span> No coding required
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">→</span> 400+ integrations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">→</span> Scheduled or webhook triggers
                </li>
              </ul>
              <a
                href="https://n8n.io/workflows"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 font-semibold text-sm flex items-center gap-1"
              >
                View n8n Examples <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Code-based */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-6 h-6 text-purple-500" />
                <h3 className="text-2xl font-semibold text-white">Python/LangChain</h3>
              </div>
              <p className="text-slate-300 mb-4">
                Build sophisticated agents using Python with LangChain, OpenAI SDK, or Anthropic SDK.
              </p>
              <ul className="space-y-2 text-slate-400 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">→</span> Full control & flexibility
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">→</span> Memory & context management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">→</span> Custom tools & plugins
                </li>
              </ul>
              <div className="bg-slate-900 border border-slate-600 rounded p-3 mb-4">
                <code className="text-xs text-slate-300">
                  <div>from langchain import OpenAI</div>
                  <div>agent = initialize_agent(...)</div>
                  <div>agent.run(prompt)</div>
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">Best Practices</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Clear Instructions',
                desc: 'Write explicit, detailed instructions. Ambiguity leads to poor results.',
                icon: BookOpen,
              },
              {
                title: 'Examples Matter',
                desc: 'Include input/output examples. Show the agent what success looks like.',
                icon: FileText,
              },
              {
                title: 'Test Thoroughly',
                desc: 'Test with edge cases and unexpected inputs before uploading.',
                icon: Zap,
              },
              {
                title: 'Document Dependencies',
                desc: 'List all required APIs, credentials, or external tools.',
                icon: Code,
              },
              {
                title: 'Version Your Agents',
                desc: 'Use semantic versioning (1.0.0) and describe changes in updates.',
                icon: Users,
              },
              {
                title: 'Collect Feedback',
                desc: 'Monitor ratings and comments. Iterate based on user feedback.',
                icon: Users,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Common Patterns */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">Common Agent Patterns</h2>

          <div className="space-y-4">
            {[
              {
                name: 'Research Agent',
                desc: 'Searches web, reads documents, compiles findings',
                tags: ['Search', 'Analysis', 'Summarization'],
              },
              {
                name: 'Code Generator',
                desc: 'Writes, debugs, and explains code based on requirements',
                tags: ['Coding', 'Debugging', 'Explanation'],
              },
              {
                name: 'Data Analyst',
                desc: 'Processes data, creates visualizations, generates reports',
                tags: ['Data', 'Analytics', 'Reporting'],
              },
              {
                name: 'Customer Support Bot',
                desc: 'Answers questions, troubleshoots, escalates to humans',
                tags: ['Support', 'FAQ', 'Escalation'],
              },
              {
                name: 'Content Creator',
                desc: 'Generates articles, social posts, email campaigns',
                tags: ['Writing', 'Marketing', 'Content'],
              },
              {
                name: 'Task Manager',
                desc: 'Creates tasks, schedules meetings, sends notifications',
                tags: ['Automation', 'Scheduling', 'Integration'],
              },
            ].map((pattern, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{pattern.name}</h3>
                    <p className="text-slate-400 mb-3">{pattern.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {pattern.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-12 text-center mb-20">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Build?</h2>
          <p className="text-lg text-slate-300 mb-8">
            Create your agent and share it with the community
          </p>
          <Link
            href="/agents/upload"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition font-semibold"
          >
            Upload Your Agent <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>Agentshive — Learn, Build, and Share AI Agents</p>
          <p className="text-sm mt-2">Join the community creating the future of automation</p>
        </div>
      </footer>
    </div>
  );
}
