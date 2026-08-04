'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

type SolutionOption = { slug: string; name: string; status: string };

export default function ConsultationForm({
  selectedSolution,
  solutions,
}: {
  selectedSolution: string;
  solutions: readonly SolutionOption[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = {
      contactName: form.get('contact_name'),
      company: form.get('company'),
      workEmail: form.get('work_email'),
      phone: form.get('phone'),
      country: form.get('country'),
      timezone: form.get('timezone'),
      preferredContact: form.get('preferred_contact'),
      bestContactTime: form.get('best_contact_time'),
      selectedSolution: form.get('selected_solution'),
      workflowProblem: form.get('workflow_problem'),
      monthlyVolume: form.get('monthly_volume'),
      systems: form.getAll('systems'),
      otherSystems: form.get('other_systems'),
      languages: form.get('languages'),
      targetOutcome: form.get('target_outcome'),
      timeline: form.get('timeline'),
      budgetBand: form.get('budget_band'),
      customBudget: form.get('custom_budget'),
      consent: form.get('consent') === 'on',
      companyFax: form.get('company_fax'),
    };

    try {
      const response = await fetch('/api/business/solution-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your request could not be saved.');
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your request could not be saved.');
    } finally {
      setSubmitting(false);
    }
  }

  if (complete) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <section className="max-w-xl rounded-3xl border border-emerald-500/30 bg-slate-900 p-9 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h1 className="mt-6 text-3xl font-bold">Consultation request received</h1>
          <p className="mt-4 leading-7 text-slate-400">
            We will review the workflow and contact you about discovery. A scoped setup estimate is usually 1–2 weeks,
            but timing is confirmed only after the consultation.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Need to add context? Email <a className="text-emerald-300" href="mailto:info@agentshive.net">info@agentshive.net</a>.
          </p>
          <Link href="/employees" className="mt-8 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500">
            Return to solutions
          </Link>
        </section>
      </main>
    );
  }

  const inputClass = 'mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-normal text-white outline-none focus:border-emerald-500';
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Solutions
          </Link>
          <a href="mailto:info@agentshive.net" className="text-sm font-semibold text-emerald-300">info@agentshive.net</a>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[0.7fr_1.3fr]">
        <aside>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Consultation first</p>
          <h1 className="mt-3 text-4xl font-bold">Tell us the outcome—not just the tool.</h1>
          <p className="mt-5 leading-7 text-slate-400">
            We review your workflow, systems, controls and expected volume before proposing an AI employee or automation.
            No payment or subscription starts from this form.
          </p>
          <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <p className="mt-4 font-semibold">What happens next</p>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
              <li>1. We review the request.</li>
              <li>2. We arrange discovery if the workflow fits.</li>
              <li>3. You receive a scoped proposal.</li>
              <li>4. Payment and setup begin only after agreement.</li>
              <li>5. Service billing begins when the agreed employee is activated.</li>
            </ol>
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-9">
          <h2 className="text-2xl font-bold">Request a solution consultation</h2>
          <p className="mt-2 text-sm text-slate-500">Fields marked required help us prepare a useful first conversation.</p>
          {error ? <p className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</p> : null}

          <form onSubmit={submit} className="mt-7 space-y-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">Contact name *<input required name="contact_name" minLength={2} maxLength={120} className={inputClass} /></label>
              <label className="text-sm font-semibold">Company *<input required name="company" minLength={2} maxLength={160} className={inputClass} /></label>
              <label className="text-sm font-semibold">Work email *<input required name="work_email" type="email" maxLength={254} className={inputClass} /></label>
              <label className="text-sm font-semibold">Phone<input name="phone" type="tel" maxLength={32} placeholder="+91…" className={inputClass} /></label>
              <label className="text-sm font-semibold">Country *<input required name="country" minLength={2} maxLength={100} className={inputClass} /></label>
              <label className="text-sm font-semibold">Timezone *<input required name="timezone" maxLength={100} placeholder="Asia/Kolkata" className={inputClass} /></label>
              <label className="text-sm font-semibold">Preferred contact *
                <select required name="preferred_contact" defaultValue="email" className={inputClass}>
                  <option value="email">Email</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp, if mutually configured</option><option value="video_call">Video call</option>
                </select>
              </label>
              <label className="text-sm font-semibold">Best contact time *<input required name="best_contact_time" maxLength={120} placeholder="Weekdays, 2–5 PM" className={inputClass} /></label>
            </div>

            <label className="block text-sm font-semibold">Selected solution *
              <select required name="selected_solution" defaultValue={selectedSolution} className={inputClass}>
                {solutions.map((solution) => <option key={solution.slug} value={solution.slug}>{solution.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Workflow or problem *<textarea required name="workflow_problem" minLength={20} maxLength={3000} rows={5} className={inputClass} /></label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">Approximate monthly volume *
                <select required name="monthly_volume" defaultValue="" className={inputClass}>
                  <option value="" disabled>Select one</option><option value="under_100">Under 100</option><option value="100_500">100–500</option><option value="501_2000">501–2,000</option><option value="over_2000">More than 2,000</option><option value="unknown">Not sure</option>
                </select>
              </label>
              <label className="text-sm font-semibold">Timeline *
                <select required name="timeline" defaultValue="" className={inputClass}>
                  <option value="" disabled>Select one</option><option value="exploring">Exploring</option><option value="within_30_days">Within 30 days</option><option value="one_to_three_months">1–3 months</option><option value="later">Later</option>
                </select>
              </label>
              <label className="text-sm font-semibold">Languages *<input required name="languages" maxLength={300} placeholder="English, Hindi, Hinglish" className={inputClass} /></label>
              <label className="text-sm font-semibold">Target outcome *<input required name="target_outcome" minLength={10} maxLength={500} placeholder="Faster first response…" className={inputClass} /></label>
              <label className="text-sm font-semibold">Budget band *
                <select required name="budget_band" defaultValue="" className={inputClass}>
                  <option value="" disabled>Select one</option><option value="under_100_usd">Under US$100/month</option><option value="100_300_usd">US$100–300/month</option><option value="301_750_usd">US$301–750/month</option><option value="751_2000_usd">US$751–2,000/month</option><option value="over_2000_usd">Over US$2,000/month</option><option value="custom">Custom / project budget</option><option value="unknown">Not sure yet</option>
                </select>
              </label>
              <label className="text-sm font-semibold">Custom budget details<input name="custom_budget" maxLength={300} className={inputClass} /></label>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold">Systems or integrations</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {['Website','Email','Google Sheets','CRM','Calendar','WhatsApp (not yet connected)','Other'].map((system) => (
                  <label key={system} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
                    <input name="systems" value={system} type="checkbox" className="h-4 w-4 accent-emerald-500" /> {system}
                  </label>
                ))}
              </div>
              <input name="other_systems" maxLength={500} placeholder="Other systems or versions" className={inputClass} />
            </fieldset>

            <label className="hidden" aria-hidden="true">Company fax<input name="company_fax" tabIndex={-1} autoComplete="off" /></label>
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-400">
              <input required name="consent" type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-emerald-500" />
              I agree that AgentsHive may store this request and contact me about consultation, proposal and setup. I understand this form does not activate a service or start billing.
            </label>

            <button disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold hover:bg-emerald-500 disabled:opacity-60">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {submitting ? 'Submitting securely…' : 'Request consultation'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
