'use client';

import Link from 'next/link';
import { Code, Mail } from 'lucide-react';

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

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
                    href="https://www.linkedin.com/company/agentshive99/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-400 transition flex items-center gap-1"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:agentshive26@gmail.com?subject=Agentshive%20feedback"
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
            <div className="flex items-center justify-center gap-4 text-sm mb-3">
              <Link href="/privacy" className="text-slate-400 hover:text-indigo-400 transition">
                Privacy Policy
              </Link>
              <span className="text-slate-700">•</span>
              <Link href="/terms" className="text-slate-400 hover:text-indigo-400 transition">
                Terms of Service
              </Link>
            </div>
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
