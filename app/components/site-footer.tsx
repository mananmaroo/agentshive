'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z" />
    </svg>
  );
}

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
                <li>
                  <Link href="/mcp" className="text-slate-400 hover:text-indigo-400 transition">
                    Connect (MCP)
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
                    href="https://instagram.com/getagentshive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-400 transition flex items-center gap-1"
                  >
                    <InstagramIcon className="w-4 h-4" />
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/getagentshive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-400 transition flex items-center gap-1"
                  >
                    <XIcon className="w-4 h-4" />
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com/@getagentshive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-400 transition flex items-center gap-1"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                    YouTube
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
