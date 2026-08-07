import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Check,
  Languages,
  Menu,
  ShieldCheck,
  Users,
} from 'lucide-react';

import RegionalPricing from './RegionalPricing';
import {
  BUSINESS_SOLUTIONS,
  SOLUTION_GROUPS,
  STATUS_LABELS,
  type SolutionStatus,
} from './catalog';

export const metadata: Metadata = {
  title: 'AgentsHive Business — AI Employees for Businesses Worldwide',
  description:
    'Consultation-led AI employees for clinics, admissions, lead follow-up and practical business workflows worldwide.',
};

function statusClass(status: SolutionStatus) {
  if (status === 'controlled_pilot') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  }
  if (status === 'consultation_available') {
    return 'border-sky-500/30 bg-sky-500/10 text-sky-200';
  }
  if (status === 'custom_build') {
    return 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200';
  }
  return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
}

const navLinks = [
  { href: '#employees', label: 'Employees' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/employees/custom', label: 'Consult now' },
  { href: '/employees/demo', label: 'View demos' },
  { href: '/employees/waitlist', label: 'Join waitlist' },
  { href: '/employees/login', label: 'Business login' },
  { href: '/registry/home', label: 'Agent Registry' },
] as const;

export default function EmployeesMarketplacePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4"
          aria-label="Business navigation"
        >
          <Link href="/" className="inline-flex min-w-0 items-center gap-2 font-bold">
            <Bot className="h-6 w-6 shrink-0 text-emerald-400" />
            <span className="truncate">AgentsHive Business</span>
          </Link>

          <div className="hidden items-center gap-5 text-sm font-semibold md:flex">
            {navLinks.map((item) =>
              item.href.startsWith('#') ? (
                <a key={item.href} href={item.href} className="text-slate-300 hover:text-white">
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className="text-slate-300 hover:text-white">
                  {item.label}
                </Link>
              ),
            )}
          </div>

          <details className="group relative md:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200">
              <Menu className="h-4 w-4" />
              Menu
            </summary>
            <div className="absolute right-0 top-12 z-50 flex w-56 flex-col rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm font-semibold shadow-2xl">
              {navLinks.map((item) =>
                item.href.startsWith('#') ? (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </details>
        </nav>
      </header>

      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,#064e3b_0%,#020617_55%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            <Bot className="h-4 w-4" />
            AI employees for businesses worldwide
          </div>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">
            Build an AI employee around the work your business needs.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Start with a consultation, choose a measurable workflow, and configure the
            knowledge, systems, languages and human controls it needs. Clinic voice
            assistance leads our consultation use cases, while admissions and 18 other
            solutions remain available to scope.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-amber-200">
            Voice is integration-dependent and is not live today. Calling requires an
            approved provider, a suitable number, safety testing and client approval.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/employees/custom?solution=phone-voice"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold transition hover:bg-emerald-500"
            >
              Consult now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#employees"
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-6 py-3 font-semibold text-slate-200 transition hover:border-emerald-500"
            >
              Explore 20 AI employees
            </a>
            <Link
              href="/employees/dashboard"
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Open client dashboard
            </Link>
          </div>
        </div>
      </section>

      <section id="employees" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Consultation-led AI solutions
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Choose the outcome you want to improve
          </h2>
          <p className="mt-4 leading-7 text-slate-400">
            The AI Voice Assistant for Clinics is our leading consultation use case,
            followed by Aarya Admissions and 18 other employee solutions. Every solution
            is scoped around approved knowledge, human controls, customer-owned access and
            the providers available in that country.
          </p>
        </div>

        <div className="space-y-14">
          {SOLUTION_GROUPS.map((group) => {
            const solutions = BUSINESS_SOLUTIONS.filter(
              (solution) => solution.group === group,
            );
            const groupId = `solution-group-${group
              .replaceAll(' ', '-')
              .toLowerCase()}`;

            return (
              <section key={group} aria-labelledby={groupId}>
                <h3 id={groupId} className="text-xl font-bold text-slate-200">
                  {group}
                </h3>
                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {solutions.map((solution) => (
                    <article
                      key={solution.slug}
                      className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-300">
                          <Bot className="h-6 w-6" />
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                            solution.status,
                          )}`}
                        >
                          {STATUS_LABELS[solution.status]}
                        </span>
                      </div>

                      <h4 className="mt-5 text-xl font-bold">{solution.name}</h4>
                      <p className="mt-2 text-sm font-semibold text-emerald-300">
                        {solution.outcome}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {solution.description}
                      </p>

                      <div className="mt-5 space-y-2">
                        {solution.examples.map((example) => (
                          <p
                            key={example}
                            className="flex items-center gap-2 text-sm text-slate-300"
                          >
                            <Check className="h-4 w-4 text-emerald-400" />
                            {example}
                          </p>
                        ))}
                      </div>

                      <p className="mt-5 border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">
                        {solution.availability}
                      </p>

                      <Link
                        href={`/employees/custom?solution=${solution.slug}`}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                      >
                        {solution.status === 'coming_later'
                          ? 'Register future interest'
                          : 'Request a consultation'}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Multiple employees, one controlled approach
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold sm:text-4xl">
            Start with the workflow—not a one-size-fits-all bot
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Languages,
                title: 'Local communication',
                body: 'Languages and dialect preferences are configured and tested per business and country.',
              },
              {
                icon: ShieldCheck,
                title: 'Human control',
                body: 'Sensitive, uncertain and policy-exception requests are sent to a person.',
              },
              {
                icon: Users,
                title: 'Provider-neutral delivery',
                body: 'Voice, messaging and business-system connections use approved client or regional providers.',
              },
            ].map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-6"
                >
                  <FeatureIcon className="h-7 w-7 text-emerald-400" />
                  <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {feature.body}
                  </p>
                </article>
              );
            })}
          </div>
          <div className="mt-10">
            <Link
              href="/employees/demo"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200"
            >
              View guided demonstrations as secondary proof
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <RegionalPricing />

      <footer className="bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-10 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-bold">AgentsHive Business</p>
            <p className="mt-1 text-sm text-slate-500">
              Consultation-led AI employees for businesses worldwide.
            </p>
          </div>
          <div className="flex gap-5 text-sm font-semibold">
            <Link href="/" className="text-slate-300 hover:text-white">
              Choose experience
            </Link>
            <Link
              href="/registry/home"
              className="text-indigo-300 hover:text-indigo-200"
            >
              Explore AI Agents
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
