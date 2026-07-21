'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  Globe2,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase-client';

const interestOptions = [
  ['admissions', 'Admissions follow-up'],
  ['general_leads', 'General lead follow-up'],
  ['website_chat', 'Website chat'],
  ['voice_email', 'Voice and email'],
] as const;

export default function BusinessWaitlistPage() {
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  function toggleInterest(value: string) {
    setInterests((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    if (String(form.get('company_fax') ?? '').trim()) {
      setComplete(true);
      setSubmitting(false);
      return;
    }

    const website = String(form.get('website_url') ?? '').trim();
    const normalizedWebsite = website && !/^https?:\/\//i.test(website) ? `https://${website}` : website;

    const { error: insertError } = await supabase.from('business_waitlist').insert({
      full_name: String(form.get('full_name') ?? '').trim(),
      work_email: String(form.get('work_email') ?? '').trim().toLowerCase(),
      company_name: String(form.get('company_name') ?? '').trim(),
      website_url: normalizedWebsite || null,
      country: String(form.get('country') ?? '').trim(),
      organization_type: String(form.get('organization_type') ?? ''),
      monthly_lead_volume: String(form.get('monthly_lead_volume') ?? ''),
      interests,
      consent_to_contact: form.get('consent_to_contact') === 'on',
      source: 'business_waitlist_page',
    });

    setSubmitting(false);

    if (insertError) {
      if (insertError.code === '23505') {
        setComplete(true);
        return;
      }
      setError('We could not save your place right now. Please check the form and try again.');
      return;
    }

    setComplete(true);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4" aria-label="Waitlist navigation">
          <Link href="/employees" className="inline-flex items-center gap-2 font-bold">
            <Bot className="h-6 w-6 text-emerald-400" />
            AgentsHive Business
          </Link>
          <Link href="/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to employees
          </Link>
        </nav>
      </header>

      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,#064e3b_0%,#020617_58%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="self-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              <Sparkles className="h-4 w-4" /> Early-access waitlist
            </div>
            <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
              Give every new lead a fast, helpful response.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Join the AgentsHive Business pilot for an AI employee that follows up with prospects across your website, email and future voice channels—using your approved knowledge and escalation rules.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {[
                [MessageSquareText, 'Admissions and lead follow-up', 'Start with one focused role and measurable outcome.'],
                [Globe2, 'Local-language ready', 'Configure languages, regional phrasing and dialect preferences.'],
                [ShieldCheck, 'Human approval first', 'Keep exceptions, sensitive replies and low-confidence answers with your team.'],
                [Check, 'No payment today', 'The waitlist reserves interest; it does not start a subscription.'],
              ].map(([Icon, title, body]) => {
                const ItemIcon = Icon as typeof Check;
                return (
                  <div key={title as string} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                    <ItemIcon className="h-6 w-6 text-emerald-400" />
                    <h2 className="mt-4 font-bold">{title as string}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{body as string}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-950/95 p-6 shadow-2xl sm:p-9">
            {complete ? (
              <div className="flex min-h-[620px] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-emerald-500/10 p-4"><Check className="h-9 w-9 text-emerald-400" /></div>
                <h2 className="mt-6 text-3xl font-bold">You’re on the waitlist.</h2>
                <p className="mt-4 max-w-md leading-7 text-slate-400">
                  We have recorded your business interest. Early pilot invitations will be sent in small groups so each setup receives proper attention.
                </p>
                <Link href="/employees" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500">
                  Explore AI employees <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Join the pilot list</p>
                <h2 className="mt-2 text-2xl font-bold">Tell us about your business</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">No card required. We will contact you only about AgentsHive Business access.</p>

                {error && <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

                <form onSubmit={joinWaitlist} className="mt-7 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-slate-300">
                      Your name
                      <input required name="full_name" minLength={2} maxLength={120} placeholder="Full name" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal text-white outline-none focus:border-emerald-500" />
                    </label>
                    <label className="text-sm font-semibold text-slate-300">
                      Work email
                      <input required name="work_email" type="email" placeholder="you@business.com" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal text-white outline-none focus:border-emerald-500" />
                    </label>
                    <label className="text-sm font-semibold text-slate-300">
                      Business name
                      <input required name="company_name" minLength={2} maxLength={160} placeholder="Your organisation" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal text-white outline-none focus:border-emerald-500" />
                    </label>
                    <label className="text-sm font-semibold text-slate-300">
                      Website
                      <input name="website_url" placeholder="example.com" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal text-white outline-none focus:border-emerald-500" />
                    </label>
                    <label className="text-sm font-semibold text-slate-300">
                      Country
                      <input required name="country" minLength={2} maxLength={100} placeholder="Country" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal text-white outline-none focus:border-emerald-500" />
                    </label>
                    <label className="text-sm font-semibold text-slate-300">
                      Organisation type
                      <select required name="organization_type" defaultValue="" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal text-white outline-none focus:border-emerald-500">
                        <option value="" disabled>Select one</option>
                        <option value="coaching_training">Coaching or training</option>
                        <option value="higher_education">Higher education</option>
                        <option value="professional_services">Professional services</option>
                        <option value="other">Other lead-heavy business</option>
                      </select>
                    </label>
                  </div>

                  <label className="block text-sm font-semibold text-slate-300">
                    Approximate new leads each month
                    <select required name="monthly_lead_volume" defaultValue="" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-normal text-white outline-none focus:border-emerald-500">
                      <option value="" disabled>Select a range</option>
                      <option value="under_100">Under 100</option>
                      <option value="100_500">100–500</option>
                      <option value="501_2000">501–2,000</option>
                      <option value="over_2000">More than 2,000</option>
                      <option value="unknown">Not sure yet</option>
                    </select>
                  </label>

                  <fieldset>
                    <legend className="text-sm font-semibold text-slate-300">What would you like the employee to handle?</legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {interestOptions.map(([value, label]) => (
                        <label key={value} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                          <input type="checkbox" checked={interests.includes(value)} onChange={() => toggleInterest(value)} className="h-4 w-4 accent-emerald-500" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="hidden" aria-hidden="true">
                    Company fax
                    <input name="company_fax" tabIndex={-1} autoComplete="off" />
                  </label>

                  <label className="flex items-start gap-3 text-sm leading-6 text-slate-400">
                    <input required name="consent_to_contact" type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-emerald-500" />
                    I agree that AgentsHive may contact me about the business pilot and related product updates.
                  </label>

                  <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 font-semibold hover:bg-emerald-500 disabled:opacity-60">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                    {submitting ? 'Saving your place…' : 'Join the waitlist'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-9 text-center text-sm text-slate-500 sm:flex-row sm:text-left">
        <p>AgentsHive Business · AI employees for practical business work.</p>
        <div className="flex gap-5 font-semibold">
          <Link href="/employees#pricing" className="text-slate-300 hover:text-white">View pricing</Link>
          <Link href="/agents" className="text-indigo-300 hover:text-indigo-200">Explore AI Agents</Link>
        </div>
      </footer>
    </main>
  );
}
