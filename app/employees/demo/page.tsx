'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type Channel = 'LinkedIn' | 'Instagram' | 'Email';
type Tone = 'Clear and expert' | 'Friendly and practical' | 'Bold and concise';

const STEPS = [
  ['Brief', 'Choose the business, audience, offer and tone.'],
  ['Draft', 'The employee prepares a channel-aware content set.'],
  ['Review', 'A person checks claims, dates and brand language.'],
  ['Handoff', 'Approved work is exported for scheduling or publishing.'],
] as const;

export default function EmployeeDemoPage() {
  const [business, setBusiness] = useState('Aarohan University');
  const [audience, setAudience] = useState('Students comparing undergraduate programmes');
  const [offer, setOffer] = useState('Applications for the September intake');
  const [tone, setTone] = useState<Tone>('Friendly and practical');
  const [channel, setChannel] = useState<Channel>('LinkedIn');
  const [generated, setGenerated] = useState(false);

  const output = useMemo(() => {
    const name = business.trim() || 'Your business';
    const target = audience.trim() || 'your audience';
    const focus = offer.trim() || 'your current offer';
    const opener =
      channel === 'LinkedIn'
        ? `Choosing the right next step should feel informed—not overwhelming.`
        : channel === 'Instagram'
          ? `Your next chapter could start here. ✨`
          : `A practical update for people considering their next step.`;

    return {
      headline: `${focus}: a clear guide from ${name}`,
      post: `${opener}\n\n${name} is helping ${target.toLowerCase()} understand ${focus.toLowerCase()}. Get the key dates, requirements and next steps from an approved source, then speak with the team if your situation needs individual guidance.\n\nLearn more through the official website. Questions that need a policy decision should always go to a person.`,
      review: [
        'Confirm the intake date and application deadline against an approved source.',
        'Replace “official website” with the client-owned destination URL.',
        'Human approval required before publishing.',
      ],
      schedule: channel === 'Email' ? 'Tuesday · 10:00 AM local time' : 'Wednesday · 12:30 PM local time',
    };
  }, [audience, business, channel, offer]);

  function downloadSample() {
    const content = [
      'AGENTSHIVE AI EMPLOYEE — DEMO OUTPUT',
      'Demonstration only · No content was published',
      '',
      `Business: ${business}`,
      `Audience: ${audience}`,
      `Channel: ${channel}`,
      `Tone: ${tone}`,
      '',
      output.headline,
      '',
      output.post,
      '',
      'HUMAN REVIEW',
      ...output.review.map((item) => `- ${item}`),
      '',
      `Suggested handoff: ${output.schedule}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'agentshive-social-media-demo.txt';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 1_000);
  }

  const field = 'mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-400';

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> AgentsHive Business
          </Link>
          <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
            Interactive demonstration
          </span>
        </div>
      </header>

      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,#312e81_0%,#020617_58%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
            <Sparkles className="h-4 w-4" /> No login · No paid AI · Nothing is published
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">Try an AI employee from brief to approved handoff.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            This guided demo shows a Social Media Content Employee preparing reviewable work. It uses deterministic sample logic,
            so it is safe to explore without connecting a social account or consuming an AI API.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">1 · Give the employee a brief</p>
          <div className="mt-6 space-y-5">
            <label className="block text-sm font-semibold">Business name
              <input value={business} onChange={(event) => setBusiness(event.target.value)} className={field} maxLength={120} />
            </label>
            <label className="block text-sm font-semibold">Audience
              <input value={audience} onChange={(event) => setAudience(event.target.value)} className={field} maxLength={180} />
            </label>
            <label className="block text-sm font-semibold">Campaign or offer
              <textarea value={offer} onChange={(event) => setOffer(event.target.value)} className={field} rows={3} maxLength={300} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Channel
                <select value={channel} onChange={(event) => setChannel(event.target.value as Channel)} className={field}>
                  <option>LinkedIn</option><option>Instagram</option><option>Email</option>
                </select>
              </label>
              <label className="text-sm font-semibold">Tone
                <select value={tone} onChange={(event) => setTone(event.target.value as Tone)} className={field}>
                  <option>Clear and expert</option><option>Friendly and practical</option><option>Bold and concise</option>
                </select>
              </label>
            </div>
            <button onClick={() => setGenerated(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-semibold hover:bg-violet-500">
              Prepare demo output <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">2 · Review the output</p>
              <h2 className="mt-2 text-2xl font-bold">Content pack</h2>
            </div>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100">Approval required</span>
          </div>

          {!generated ? (
            <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-8 text-center">
              <FileText className="h-10 w-10 text-slate-600" />
              <p className="mt-4 font-semibold text-slate-300">Your reviewable draft will appear here.</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Adjust the brief, then prepare the output. No data leaves this page.</p>
            </div>
          ) : (
            <div className="mt-7 space-y-5">
              <article className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-sky-300"><MessageSquareText className="h-4 w-4" /> {channel} draft</div>
                <h3 className="mt-4 text-xl font-bold">{output.headline}</h3>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">{output.post}</p>
              </article>
              <article className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-amber-100"><ShieldCheck className="h-5 w-5" /> Human review checklist</h3>
                <div className="mt-4 space-y-3">
                  {output.review.map((item) => <p key={item} className="flex gap-3 text-sm leading-6 text-slate-300"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-amber-300" /> {item}</p>)}
                </div>
              </article>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-950 p-5">
                <p className="flex items-center gap-2 text-sm text-slate-300"><CalendarDays className="h-5 w-5 text-violet-300" /> Suggested handoff: {output.schedule}</p>
                <button onClick={downloadSample} className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold hover:border-violet-400">
                  <Download className="h-4 w-4" /> Download sample
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">How a real deployment differs</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, body], index) => (
              <article key={title} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <span className="text-xs font-bold text-violet-300">STEP {index + 1}</span>
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-slate-500">
            A production employee is configured only after its approved knowledge, permissions, channels, review rules and provider costs are agreed.
          </p>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Want this workflow adapted to your business?</h2>
          <p className="mt-3 max-w-2xl text-slate-400">The consultation form will open with Social Media Automation already selected. Submitting it does not activate billing.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/embed/admissions-demo" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold hover:border-emerald-400">Preview Aarya · Access-gated</Link>
          <Link href="/employees/custom?solution=social-media-automation" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500">
            Request consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
