'use client';

import Link from 'next/link';
import { Code, Mail, Coffee } from 'lucide-react';

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

export function SharedFooter() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                A
              </div>
              <h3 className="text-lg font-bold text-white">Agentshive</h3>
            </div>
            <p className="text-slate-400 text-sm">
              The open registry for AI agents. Discover, share, and learn.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/agents" className="text-slate-400 hover:text-white text-sm transition">
                  Browse Agents
                </Link>
              </li>
              <li>
                <Link href="/agents/upload" className="text-slate-400 hover:text-white text-sm transition">
                  Upload Agent
                </Link>
              </li>
              <li>
                <Link href="/top-agents" className="text-slate-400 hover:text-white text-sm transition">
                  Top Agents
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-slate-400 hover:text-white text-sm transition">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/learn-videos" className="text-slate-400 hover:text-white text-sm transition">
                  Learn Videos
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-white text-sm transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-white text-sm transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/request-agent" className="text-slate-400 hover:text-white text-sm transition">
                  Request Agent
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-slate-400 hover:text-white text-sm transition">
                  Donate / Support
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white text-sm transition">
                  About Us
                </Link>
              </li>
              <li>
                <a href="mailto:agentshive26@gmail.com" className="text-slate-400 hover:text-white text-sm transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <p className="text-slate-400 text-sm">
              © 2026 Agentshive. Open source agent registry.
            </p>
            <a
              href="https://buymeacoffee.com/maroomanan3"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold px-4 py-2 rounded-lg transition text-sm"
            >
              <Coffee className="w-4 h-4" />
              Buy me a coffee
            </a>
            <div className="flex items-center gap-4">
              <a href="https://github.com/mananmaroo/agentshive" className="text-slate-400 hover:text-white transition">
                <Code className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/agentshive99/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition">
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a href="mailto:agentshive26@gmail.com" className="text-slate-400 hover:text-white transition">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          <p className="text-center md:text-right text-sm font-light tracking-widest">
            <span className="text-slate-500">✨ Created by </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-semibold">Mikrosmos</span>
            <span className="text-slate-500"> ✨</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
