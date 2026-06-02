'use client';

import { Heart, Zap, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">About Agentshive</h1>
          <p className="text-xl text-slate-400">
            Building the open registry for AI agents
          </p>
        </div>

        {/* Mission Section */}
        <section className="border border-slate-800 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Agentshive exists to democratize AI agent development. We believe that the best agents are built collaboratively, shared openly, and improved continuously by the community.
          </p>
          <p className="text-slate-300 leading-relaxed">
            By creating a centralized registry for AI agents, we enable developers to discover proven solutions, share their innovations, and build faster together. Every agent uploaded saves someone else hours of development time and tokens.
          </p>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-800 rounded-lg p-6">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Open & Free</h3>
              <p className="text-slate-400">
                No paywalls. No gatekeeping. Agentshive is free forever. We believe in open-source collaboration.
              </p>
            </div>

            <div className="border border-slate-800 rounded-lg p-6">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Community First</h3>
              <p className="text-slate-400">
                Built by developers, for developers. Your feedback shapes our roadmap.
              </p>
            </div>

            <div className="border border-slate-800 rounded-lg p-6">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Quality Matters</h3>
              <p className="text-slate-400">
                Ratings, comments, and reviews ensure you can trust the agents you download.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border border-slate-800 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">What You Can Do</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">✓</span>
              <span className="text-slate-300">
                <strong>Discover</strong> agents for data science, automation, content creation, and more
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">✓</span>
              <span className="text-slate-300">
                <strong>Upload</strong> your agents in any format (markdown, n8n, code, video)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">✓</span>
              <span className="text-slate-300">
                <strong>Rate and review</strong> agents to help others find quality solutions
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">✓</span>
              <span className="text-slate-300">
                <strong>Collaborate</strong> with creators through comments and feedback
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">✓</span>
              <span className="text-slate-300">
                <strong>Request custom agents</strong> built to your specifications
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold">✓</span>
              <span className="text-slate-300">
                <strong>Learn</strong> from video tutorials and blog posts from the community
              </span>
            </li>
          </ul>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-slate-400 mb-2">10+</div>
            <div className="text-slate-300">Agents in Registry</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-slate-400 mb-2">5</div>
            <div className="text-slate-300">Runtimes Supported</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-slate-400 mb-2">Free</div>
            <div className="text-slate-300">Forever & Always</div>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Supported Agent Formats</h2>
          <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">
            Agentshive is runtime-agnostic. Whatever you use to build agents, you can share it here.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: 'Claude Code', icon: '🤖' },
              { name: 'Codex / OpenAI', icon: '💻' },
              { name: 'n8n Templates', icon: '⚙️' },
              { name: 'LangChain / Code', icon: '🐍' },
              { name: 'Videos & Guides', icon: '🎥' },
            ].map((format) => (
              <div
                key={format.name}
                className="border border-slate-800 hover:border-slate-600 rounded-lg p-4 text-center transition-colors duration-200"
              >
                <div className="text-3xl mb-2">{format.icon}</div>
                <p className="text-slate-300 font-medium text-sm">{format.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Questions or Suggestions?
          </h2>
          <p className="text-slate-300 mb-6">
            We'd love to hear from you. Get in touch with the Agentshive team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:agentshive26@gmail.com"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              Contact Us
            </a>
            <a
              href="https://www.linkedin.com/company/agentshive99/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0a66c2] hover:bg-[#0959ab] text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
              </svg>
              Follow us on LinkedIn
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
