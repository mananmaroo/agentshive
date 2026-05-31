'use client';

import Link from 'next/link';
import { Coffee, Heart, Zap } from 'lucide-react';

export default function Donate() {
  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Heart className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Support Agentshive</h1>
          <p className="text-lg text-slate-400 mb-2">
            Help keep the platform alive and growing
          </p>
          <p className="text-indigo-400">
            Our servers cost $250/month to maintain. Your support helps us continue providing free access to everyone.
          </p>
        </div>

        {/* Donation Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Buy Me a Coffee */}
          <div className="bg-white border border-slate-700 rounded-lg p-8 hover:border-amber-400 transition">
            <div className="flex items-center gap-3 mb-4">
              <Coffee className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Buy Me a Coffee</h2>
            </div>
            <p className="text-slate-400 mb-6">
              One-time or recurring donations directly support server costs and platform development.
            </p>
            <a
              href="https://buymeacoffee.com/maroomanan3"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-center transition"
            >
              Support on Buy Me a Coffee
            </a>
          </div>

          {/* GitHub Sponsors */}
          <div className="bg-white border border-slate-700 rounded-lg p-8 hover:border-amber-400 transition">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">GitHub Sponsors</h2>
            </div>
            <p className="text-slate-400 mb-6">
              Sponsor the project on GitHub and get recognized as a supporter of open-source AI tools.
            </p>
            <a
              href="https://github.com/sponsors/mananmaroo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-center transition"
            >
              Become a Sponsor
            </a>
          </div>
        </div>

        {/* Other Ways to Support */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Other Ways to Support</h2>
          <ul className="space-y-4 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold mt-1">•</span>
              <span>
                <strong>Spread the word:</strong> Share Agentshive with your network. Word-of-mouth helps us grow.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold mt-1">•</span>
              <span>
                <strong>Contribute code:</strong> Check out our{' '}
                <a
                  href="https://github.com/mananmaroo/agentshive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-slate-400 font-semibold underline"
                >
                  GitHub repository
                </a>{' '}
                and contribute features or fixes.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold mt-1">•</span>
              <span>
                <strong>Upload agents:</strong> Share your own agents and help the community grow smarter together.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 font-bold mt-1">•</span>
              <span>
                <strong>Provide feedback:</strong> Help us improve by sharing suggestions and reporting bugs.
              </span>
            </li>
          </ul>
        </div>

        {/* Thank You */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 rounded-lg border border-slate-700">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-white font-semibold">
            Thank you for supporting the open agent ecosystem! 💜
          </p>
        </div>
      </div>
    </div>
  );
}
