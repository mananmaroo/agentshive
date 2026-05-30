'use client';

import { Heart, Coffee, Server } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <Heart className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Support Agentshive
          </h1>
          <p className="text-xl text-amber-700">
            Help us keep the platform running and improving
          </p>
        </div>

        {/* Server Costs */}
        <section className="bg-white border border-amber-300 rounded-lg p-8 mb-12">
          <div className="flex items-start gap-4 mb-6">
            <Server className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                Server & Infrastructure Costs
              </h2>
              <p className="text-amber-800 leading-relaxed">
                Running Agentshive requires reliable infrastructure, database storage, and CDN capacity to serve thousands of agents to millions of users worldwide.
              </p>
            </div>
          </div>

          <div className="bg-amber-100 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-amber-900 font-semibold mb-4">Monthly Costs</h3>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-amber-800">Supabase Database</span>
                    <span className="text-amber-900 font-semibold">$100</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-amber-800">Vercel Hosting</span>
                    <span className="text-amber-900 font-semibold">$80</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-amber-800">Storage & CDN</span>
                    <span className="text-amber-900 font-semibold">$50</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-amber-800">Monitoring & Analytics</span>
                    <span className="text-amber-900 font-semibold">$20</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-amber-200 to-orange-200 border border-amber-400 rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-900 mb-2">
                    $250
                  </div>
                  <p className="text-amber-800">per month</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-amber-700 text-sm">
            * These costs cover basic operations. As we grow, infrastructure needs will increase.
          </p>
        </section>

        {/* Donation Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-amber-900 mb-8 text-center">
            Ways to Support Us
          </h2>

          <div className="space-y-6">
            {/* Coffee Donation */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Coffee className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">
                    Buy Me a Coffee ☕
                  </h3>
                  <p className="text-amber-800 mb-4">
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
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-300 rounded flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-900 font-bold text-sm">GH</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">
                    GitHub Sponsors 💎
                  </h3>
                  <p className="text-amber-800 mb-4">
                    Become a sponsor and get exclusive benefits, early access to features, and your name on our contributors list.
                  </p>
                  <a
                    href="https://github.com/sponsors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Become a Sponsor
                  </a>
                </div>
              </div>
            </div>

            {/* Contribute Code */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-300 rounded flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-900 font-bold text-sm">👨‍💻</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">
                    Contribute Code 🔧
                  </h3>
                  <p className="text-amber-800 mb-4">
                    Help improve Agentshive by contributing features, bug fixes, or documentation. Every contribution makes the platform better.
                  </p>
                  <a
                    href="https://github.com/mananmaroo/agentshive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Spread the Word */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-1">📢</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">
                    Spread the Word 🗣️
                  </h3>
                  <p className="text-amber-800 mb-4">
                    Share Agentshive with your network. Tweet about us, recommend us to friends, and help grow the community.
                  </p>
                  <a
                    href="https://twitter.com/intent/tweet?text=Check%20out%20Agentshive%20-%20the%20open%20registry%20for%20Claude%20agents!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Share on Twitter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Thank You Message */}
        <section className="bg-white border border-amber-300 rounded-lg p-8 text-center">
          <Heart className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-900 mb-4">
            Thank You!
          </h2>
          <p className="text-amber-800 mb-6 max-w-2xl mx-auto">
            Whether you contribute financially, with code, or just by using Agentshive, you're helping shape the future of AI agent development. We're grateful for every single supporter.
          </p>
          <p className="text-amber-700">
            Questions? Email us at <a href="mailto:support@agentshive.net" className="text-amber-600 hover:text-amber-700 font-semibold">support@agentshive.net</a>
          </p>
        </section>
      </main>
    </div>
  );
}
