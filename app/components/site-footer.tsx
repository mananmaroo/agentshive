'use client';

import Link from 'next/link';
import { Code, Share2 } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-amber-200 bg-amber-50 mt-20">
      {/* Supported Formats Section */}
      <div className="bg-amber-100/30 border-b border-amber-300 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl font-bold text-amber-900 mb-6 text-center">Supported Agent Formats</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: 'Claude.md', icon: '🤖' },
              { name: 'n8n Templates', icon: '⚙️' },
              { name: 'Codex Agents', icon: '💻' },
              { name: 'Videos', icon: '🎥' },
              { name: 'Code Snippets', icon: '📝' },
            ].map((format) => (
              <div key={format.name} className="bg-amber-50 rounded-lg p-3 text-center hover:bg-white transition">
                <div className="text-2xl mb-1">{format.icon}</div>
                <p className="text-amber-900 font-medium text-xs">{format.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h4 className="font-bold text-amber-900 mb-4">Agentshive</h4>
              <p className="text-sm text-amber-700">Open registry for Claude agents. Discover, share, and download agent templates.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-amber-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/agents" className="text-amber-700 hover:text-amber-900 transition">
                    Browse Agents
                  </Link>
                </li>
                <li>
                  <Link href="/agents/upload" className="text-amber-700 hover:text-amber-900 transition">
                    Upload Agent
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-amber-700 hover:text-amber-900 transition">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/top-agents" className="text-amber-700 hover:text-amber-900 transition">
                    Trending
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-amber-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/learn-videos" className="text-amber-700 hover:text-amber-900 transition">
                    Learn
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-amber-700 hover:text-amber-900 transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-amber-700 hover:text-amber-900 transition">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/request-agent" className="text-amber-700 hover:text-amber-900 transition">
                    Request Agent
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-amber-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/donate" className="text-amber-700 hover:text-amber-900 transition">
                    Donate
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-amber-700 hover:text-amber-900 transition">
                    Help Center
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/mananmaroo/agentshive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 hover:text-amber-900 transition flex items-center gap-1"
                  >
                    <Code className="w-4 h-4" />
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 hover:text-amber-900 transition flex items-center gap-1"
                  >
                    <Share2 className="w-4 h-4" />
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-amber-200 pt-8 text-center">
            <p className="text-sm text-amber-700 mb-2">
              Agentshive — Open Registry for Claude Agents
            </p>
            <p className="text-xs text-amber-600">
              Built with Next.js, Supabase, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
