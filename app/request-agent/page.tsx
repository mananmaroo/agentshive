'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function RequestAgentPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    useCase: '',
    budget: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/agent-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_name: formData.name,
          requester_email: formData.email,
          agent_description: formData.description,
          use_case: formData.useCase,
          budget: formData.budget ? parseInt(formData.budget) : null,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', description: '', useCase: '', budget: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError('Failed to submit request. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Request a Custom Agent
          </h1>
          <p className="text-xl text-slate-400">
            Can't find what you need? Request a custom agent built to your specifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Form */}
          <div>
            <div className="border border-slate-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Tell Us What You Need</h2>

              {submitted && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-900 font-semibold">Request submitted!</p>
                    <p className="text-green-800 text-sm">We'll review your request and get back to you soon.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-900">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Agent Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition resize-none"
                    placeholder="Describe the agent you need. What should it do?"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Use Case *</label>
                  <textarea
                    name="useCase"
                    value={formData.useCase}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition resize-none"
                    placeholder="How will you use this agent? What problem does it solve?"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Budget (Optional)</label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none transition"
                  >
                    <option value="">Not specified</option>
                    <option value="500">$0 - $500</option>
                    <option value="1000">$500 - $1,000</option>
                    <option value="2500">$1,000 - $2,500</option>
                    <option value="5000">$2,500 - $5,000</option>
                    <option value="10000">$5,000+</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-3">What Happens Next?</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </span>
                  <span className="text-slate-300">We review your request and assess feasibility</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </span>
                  <span className="text-slate-300">Our team discusses the scope and timeline</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </span>
                  <span className="text-slate-300">We'll contact you with a proposal or estimate</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    4
                  </span>
                  <span className="text-slate-300">Once approved, development begins and updates are shared</span>
                </li>
              </ol>
            </div>

            <div className="border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-3">✨ Tips for Your Request</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Be specific about agent behavior and expected outputs</li>
                <li>• Include examples of what success looks like</li>
                <li>• Mention any integrations needed (APIs, tools, etc.)</li>
                <li>• Share your timeline and budget if possible</li>
                <li>• The more detail, the better the estimate</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-3">📞 Prefer to Discuss?</h3>
              <p className="text-slate-300 mb-4">
                Email us directly to discuss your needs with our team
              </p>
              <a
                href="mailto:agentshive26@gmail.com"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
