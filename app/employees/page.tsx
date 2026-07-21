import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CalendarCheck,
  Headphones,
  Languages,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const employees = [
  {
    name: 'Aarya',
    role: 'AI Lead Follow-up Employee',
    description:
      'Replies to enquiries, qualifies prospects, schedules appointments, and prepares a daily follow-up list.',
    icon: MessageSquareText,
    status: 'Pilot',
    languages: ['English', 'Hindi', 'Hinglish'],
  },
  {
    name: 'Mitra',
    role: 'AI Customer Support Employee',
    description:
      'Answers approved questions, tracks unresolved requests, and escalates sensitive conversations to a person.',
    icon: Headphones,
    status: 'Coming next',
    languages: ['English', 'Hindi'],
  },
  {
    name: 'Tara',
    role: 'AI Appointment Employee',
    description:
      'Finds available slots, confirms bookings, sends reminders, and keeps the business calendar organised.',
    icon: CalendarCheck,
    status: 'Coming next',
    languages: ['English', 'Hindi', 'Regional language ready'],
  },
];

const principles = [
  {
    icon: Languages,
    title: 'Built for how India speaks',
    body: 'Employees can be configured for English, Hindi, Hinglish, and regional language or dialect preferences while preserving the business tone.',
  },
  {
    icon: ShieldCheck,
    title: 'Humans stay in control',
    body: 'Low-confidence, sensitive, refund, discount, and complaint requests can be held for human approval.',
  },
  {
    icon: Sparkles,
    title: 'Start without new software bills',
    body: 'The pilot begins with existing AgentsHive, Vercel, and Supabase free resources. Paid AI usage stays disabled until approved.',
  },
];

export default function EmployeesMarketplacePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,#312e81_0%,#020617_52%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
            <Bot className="h-4 w-4" />
            AgentsHive for Indian SMEs
          </div>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">
            Hire an AI employee that speaks like your customers do.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Deploy practical AI employees for lead follow-up, customer support, and appointments.
            Start with human approval, train them on your business, and add local languages and
            dialect preferences as you grow.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#employees"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500"
            >
              Meet the employees <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/agents"
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Browse community agents
            </Link>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              ['₹0', 'new platform spend for the first prototype'],
              ['1', 'working employee before expanding'],
              ['Human-first', 'approval and escalation controls'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-2xl font-bold text-indigo-300">{value}</p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="employees" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
            Employee marketplace
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Choose a job, not a complicated tool</h2>
          <p className="mt-4 text-slate-400">
            Each listing explains the employee&apos;s responsibilities, supported languages, and
            current availability. Aarya is the first employee being built for a controlled pilot.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {employees.map(({ name, role, description, icon: Icon, status, languages }) => (
            <article
              key={name}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-300">
                  <Icon className="h-7 w-7" />
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                  {status}
                </span>
              </div>

              <p className="mt-6 text-sm font-semibold text-indigo-300">{name}</p>
              <h3 className="mt-1 text-xl font-bold">{role}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{description}</p>

              <div className="mt-6 border-t border-slate-800 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Language setup
                </p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <span
                      key={language}
                      className="rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-20 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <Icon className="h-7 w-7 text-indigo-400" />
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <Users className="mx-auto h-10 w-10 text-indigo-400" />
        <h2 className="mt-5 text-3xl font-bold">The first pilot stays intentionally small.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          One employee, one repeatable workflow, and a handful of businesses. We will measure
          completed work and human escalations before adding paid APIs, voice, or WhatsApp.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 text-sm text-slate-300">
          <BadgeCheck className="h-5 w-5 text-emerald-400" />
          No payment method or paid service is required for this prototype.
        </div>
      </section>
    </main>
  );
}
