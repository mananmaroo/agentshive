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
            <div className="text-3xl font-bold text-slate-400 mb-2">100+</div>
            <div className="text-slate-300">Agents in Registry</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-slate-400 mb-2">1000+</div>
            <div className="text-slate-300">Community Members</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-slate-400 mb-2">Free</div>
            <div className="text-slate-300">Forever & Always</div>
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
          <a
            href="mailto:hello@agentshive.net"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            Contact Us
          </a>
        </section>
      </main>
    </div>
  );
}
