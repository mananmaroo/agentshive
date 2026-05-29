'use client';

import { Heart, Coffee, Server } from 'lucide-react';
import { SharedNavbar } from '@/app/components/shared-navbar';
import { SharedFooter } from '@/app/components/shared-footer';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <SharedNavbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Support AgentStack
          </h1>
          <p className="text-xl text-slate-400">
            Help us keep the platform running and improving
          </p>
        </div>

        {/* Server Costs */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-12">
          <div className="flex items-start gap-4 mb-6">
            <Server className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Server & Infrastructure Costs
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Running AgentStack requires reliable infrastructure, database storage, and CDN capacity to serve thousands of agents to millions of users worldwide.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-4">Monthly Costs</h3>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-slate-400">Supabase Database</span>
                    <span className="text-white font-semibold">$100</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-400">Vercel Hosting</span>
                    <span className="text-white font-semibold">$80</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-400">Storage & CDN</span>
                    <span className="text-white font-semibold">$50</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-400">Monitoring & Analytics</span>
                    <span className="text-white font-semibold">$20</span>
                  </li>
                </ul>
              </div>
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    $250
                  </div>
                  <p className="text-slate-300">per month</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-slate-400 text-sm">
            * These costs cover basic operations. As we grow, infrastructure needs will increase.
          </p>
        </section>

        {/* Donation Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Ways to Support Us
          </h2>

          <div className="space-y-6">
            {/* Coffee Donation */}
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Coffee className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Buy Me a Coffee ☕
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Support development one coffee at a time. Every coffee helps keep our team fueled and motivated.
                  </p>
                  <a
                    href="https://buymeacoffee.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Buy Me a Coffee
                  </a>
                </div>
              </div>
            </div>

            {/* GitHub Sponsors */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">GH</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    GitHub Sponsors 💎
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Become a sponsor and get exclusive benefits, early access to features, and your name on our contributors list.
                  </p>
                  <a
                    href="https://github.com/sponsors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Become a Sponsor
                  </a>
                </div>
              </div>
            </div>

            {/* Contribute Code */}
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-400 font-bold text-sm">👨‍💻</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Contribute Code 🔧
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Help improve AgentStack by contributing features, bug fixes, or documentation. Every contribution makes the platform better.
                  </p>
                  <a
                    href="https://github.com/agentstack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Spread the Word */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-1">📢</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Spread the Word 🗣️
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Share AgentStack with your network. Tweet about us, recommend us to friends, and help grow the community.
                  </p>
                  <a
                    href="https://twitter.com/intent/tweet?text=Check%20out%20AgentStack%20-%20the%20open%20registry%20for%20Claude%20agents!%20https://agentstack.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Share on Twitter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Thank You Message */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
          <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Thank You!
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Whether you contribute financially, with code, or just by using AgentStack, you're helping shape the future of AI agent development. We're grateful for every single supporter.
          </p>
          <p className="text-slate-400">
            Questions? Email us at <a href="mailto:support@agentstack.dev" className="text-blue-400 hover:text-blue-300">support@agentstack.dev</a>
          </p>
        </section>
      </main>

      <SharedFooter />
    </div>
  );
}
