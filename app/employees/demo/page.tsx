'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  Instagram,
  Linkedin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type Platform = 'Instagram' | 'LinkedIn' | 'Facebook';
type Tone = 'Friendly' | 'Professional' | 'Bold' | 'Educational';

const platformOptions: { name: Platform; icon: typeof Instagram }[] = [
  { name: 'Instagram', icon: Instagram },
  { name: 'LinkedIn', icon: Linkedin },
  { name: 'Facebook', icon: MessageSquareText },
];

const tones: Tone[] = ['Friendly', 'Professional', 'Bold', 'Educational'];

function buildPosts(business: string, goal: string, platform: Platform, tone: Tone) {
  const name = business.trim() || 'Sunrise Learning Studio';
  const objective = goal.trim() || 'promote a weekend career workshop';
  const voice = tone.toLowerCase();

  return [
    {
      day: 'Monday',
      format: platform === 'Instagram' ? 'Carousel' : 'Insight post',
      status: 'Ready for review',
      copy: `${name} is helping its community ${objective}. Here are three practical ideas people can use this week - explained in a ${voice} way.`,
      cta: 'Save this post and share it with someone who may benefit.',
    },
    {
      day: 'Wednesday',
      format: platform === 'LinkedIn' ? 'Founder perspective' : 'Behind the scenes',
      status: 'Needs image',
      copy: `What does it take to ${objective}? At ${name}, the process begins with listening, a clear plan and useful guidance - not empty promises.`,
      cta: 'Reply with the question you would like us to cover next.',
    },
    {
      day: 'Friday',
      format: platform === 'Instagram' ? 'Short video script' : 'Community post',
      status: 'Approval required',
      copy: `This week at ${name}: one simple invitation for people ready to ${objective}. Review the details, ask questions and decide whether the next step is right for you.`,
      cta: 'Contact the team for approved dates, eligibility and availability.',
    },
  ];
}

export default function SocialMediaEmployeeDemoPage() {
  const [business, setBusiness] = useState('Sunrise Learning Studio');
  const [goal, setGoal] = useState('promote a weekend career workshop');
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [tone, setTone] = useState<Tone>('Friendly');
  const [generated, setGenerated] = useState(true);
  const [approved, setApproved] = useState<Record<number, boolean>>({});

  const posts = useMemo(() => buildPosts(business, goal, platform, tone), [business, goal, platform, tone]);

  const generate = (event: FormEvent) => {
    event.preventDefault();
    setApproved({});
    setGenerated(true);
  };

  const download = () => {
    const rows = [
      ['Day', 'Platform', 'Format', 'Tone', 'Draft', 'Call to action', 'Demo approval'],
      ...posts.map((post, index) => [
        post.day,
        platform,
        post.format,
        tone,
        post.copy,
        post.cta,
        approved[index] ? 'Approved in demo' : 'Awaiting review',
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'agentshive-social-media-demo.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4" aria-label="Demo navigation">
          <Link href="/employees" className="font-bold text-emerald-300 hover:text-emerald-200">AgentsHive Business</Link>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link href="/embed/admissions-demo" className="hidden text-slate-300 hover:text-white sm:inline">Aarya admissions demo</Link>
            <Link href="/employees/custom?solution=social-media-automation" className="rounded-lg border border-emerald-500/40 px-3 py-2 text-emerald-200 hover:bg-emerald-500/10">Request consultation</Link>
          </div>
        </nav>
      </header>

      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,#164e63_0%,#020617_58%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100">
            <Eye className="h-4 w-4" /> Guided demonstration - no login required
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">Meet the Social Media Content AI Employee</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Try a fictional campaign brief and see how a future employee could prepare draft posts, a content calendar and an approval queue. This demonstration uses templates in your browser; it does not publish, connect accounts or run paid AI.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[0.85fr_1.35fr]">
        <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:sticky lg:top-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-cyan-300" />
            <div><h2 className="text-xl font-bold">Campaign brief</h2><p className="text-sm text-slate-500">Use fictional information only.</p></div>
          </div>
          <form onSubmit={generate} className="mt-6 space-y-5">
            <label className="block text-sm font-semibold text-slate-200">Fictional business
              <input value={business} onChange={(event) => setBusiness(event.target.value)} maxLength={100} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500" />
            </label>
            <label className="block text-sm font-semibold text-slate-200">Campaign goal
              <textarea value={goal} onChange={(event) => setGoal(event.target.value)} maxLength={240} rows={4} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500" />
            </label>
            <fieldset>
              <legend className="text-sm font-semibold text-slate-200">Platform</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {platformOptions.map(({ name, icon: Icon }) => (
                  <button key={name} type="button" onClick={() => setPlatform(name)} aria-pressed={platform === name} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${platform === name ? 'border-cyan-400 bg-cyan-500/10 text-cyan-100' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    <Icon className="h-4 w-4" /> {name}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm font-semibold text-slate-200">Tone
              <select value={tone} onChange={(event) => setTone(event.target.value as Tone)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500">
                {tones.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <button className="w-full rounded-xl bg-cyan-600 px-5 py-3 font-semibold hover:bg-cyan-500">Prepare sample content</button>
          </form>
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5 text-amber-100/80">
            No social account, scheduler, CRM or AI provider is connected. Outputs are illustrative drafts and always require human review.
          </div>
        </section>

        <section aria-live="polite">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">Sample workspace</p>
              <h2 className="mt-2 text-3xl font-bold">{platform} content calendar</h2>
              <p className="mt-2 text-slate-400">{tone} tone - three demonstration drafts</p>
            </div>
            <button type="button" onClick={download} disabled={!generated} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-500 disabled:opacity-50">
              <Download className="h-4 w-4" /> Download sample CSV
            </button>
          </div>

          <div className="mt-7 space-y-5">
            {posts.map((post, index) => (
              <article key={post.day} className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-cyan-300" />
                    <div><h3 className="font-bold">{post.day} - {post.format}</h3><p className="text-xs text-slate-500">{post.status}</p></div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${approved[index] ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}`}>
                    {approved[index] ? 'Approved in demo' : 'Human approval required'}
                  </span>
                </div>
                <p className="mt-5 whitespace-pre-line leading-7 text-slate-200">{post.copy}</p>
                <p className="mt-4 rounded-xl bg-slate-950 p-4 text-sm text-slate-400"><strong className="text-slate-200">Suggested CTA:</strong> {post.cta}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setApproved((current) => ({ ...current, [index]: true }))} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500">
                    <CheckCircle2 className="h-4 w-4" /> Approve sample
                  </button>
                  <button type="button" onClick={() => setApproved((current) => ({ ...current, [index]: false }))} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-slate-500">Return for edits</button>
                </div>
              </article>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-300" />
              <div>
                <h2 className="text-xl font-bold">How a real deployment would be scoped</h2>
                <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-300 sm:grid-cols-3">
                  <li className="rounded-xl border border-slate-800 bg-slate-950 p-4"><strong>1. Learn</strong><br />Approve brand voice, products and prohibited claims.</li>
                  <li className="rounded-xl border border-slate-800 bg-slate-950 p-4"><strong>2. Review</strong><br />Define who approves drafts and what must escalate.</li>
                  <li className="rounded-xl border border-slate-800 bg-slate-950 p-4"><strong>3. Connect</strong><br />Only then configure customer-owned tools and permissions.</li>
                </ol>
                <Link href="/employees/custom?solution=social-media-automation" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500">
                  Continue to consultation <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
