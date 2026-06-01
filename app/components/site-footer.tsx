'use client';

import Link from 'next/link';
import { Code, Mail } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-20">
      {/* Main Footer */}
      <div className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h4 className="font-bold text-white mb-4">Agentshive</h4>
              <p className="text-sm text-slate-400">Open registry for AI agents. Discover, share, and download agent templates for any runtime.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/agents" className="text-slate-400 hover:text-indigo-400 transition">
                    Browse Agents
                  </Link>
                </li>
                <li>
                  <Link href="/agents/upload" className="text-slate-400 hover:text-indigo-400 transition">
                    Upload Agent
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-slate-400 hover:text-indigo-400 transition">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/top-agents" className="text-slate-400 hover:text-indigo-400 transition">
                    Trending
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/learn-videos" className="text-slate-400 hover:text-indigo-400 transition">
                    Learn
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-slate-400 hover:text-indigo-400 transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-slate-400 hover:text-indigo-400 transition">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/request-agent" className="text-slate-400 hover:text-indigo-400 transition">
                    Request Agent
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/donate" className="text-slate-400 hover:text-indigo-400 transition">
                    Donate
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-slate-400 hover:text-indigo-400 transition">
                    Help Center
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/mananmaroo/agentshive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-400 transition flex items-center gap-1"
                  >
                    <Code className="w-4 h-4" />
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:aluminus99@gmail.com?subject=Agentshive%20feedback"
                    className="text-slate-400 hover:text-indigo-400 transition flex items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />
                    Send feedback
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-sm text-slate-400 mb-2">
              Agentshive — Open Registry for AI Agents
            </p>
            <p className="text-xs text-slate-500">
              Created by <span className="text-indigo-400 font-semibold">Mikro-kosmos</span> • Built with Next.js, Supabase, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
