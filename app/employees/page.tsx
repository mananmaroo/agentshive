import Link from 'next/link';
import RegionalPricing from './RegionalPricing';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Bot,
  Check,
  CircleAlert,
  Clock3,
  Languages,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';

const employees = [
  {
    name: 'Aarya',
    role: 'AI Admissions Employee',
    audience: 'For coaching institutes',
    description:
      'Answers course enquiries, captures student details, checks approved eligibility rules, books counselling calls, and follows up with interested students.',
    icon: BookOpenCheck,
    accent: 'indigo',
    languages: ['English', 'Hindi', 'Hinglish', 'Local-language ready'],
    tasks: ['Course enquiries', 'Lead qualification', 'Counselling bookings', 'Follow-up reminders'],
  },
  {
    name: 'Kabir',
    role: 'AI Lead Follow-up Employee',
    audience: 'For service businesses',
    description:
      'Responds to new leads, asks approved qualifying questions, schedules the next step, updates the lead record, and escalates exceptions.',
    icon: MessageSquareText,
    accent: 'emerald',
    languages: ['English', 'Hindi', 'Hinglish', 'Dialect preferences'],
    tasks: ['Instant response', 'Lead qualification', 'Appointment scheduling', 'Daily owner summary'],
  },
] as const;

export default function EmployeesMarketplacePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4" aria-label="Business navigation">
          <Link href="/" className="inline-flex items-center gap-2 font-bold">
            <Bot className="h-6 w-6 text-emerald-400" />
            AgentsHive Business
          </Link>
          <div className="flex items-center gap-5 text-sm font-semibold">
            <a href="#employees" className="text-slate-300 hover:text-white">Employees</a>
            <a href="#pricing" className="text-slate-300 hover:text-white">Pricing</a>\n            <Link href="/employees/waitlist" className="text-emerald-300 hover:text-emerald-200">Join waitlist</Link>
            <Link href="/employees/login" className="text-emerald-300 hover:text-emerald-200">Business login</Link>
            <Link href="/agents" className="text-indigo-300 hover:text-indigo-200">Explore Agents</Link>
          </div>
        </nav>
      </header>

      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,#064e3b_0%,#020617_55%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            <Sparkles className="h-4 w-4" />
            AI employees for Indian SMEs
          </div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">
            Follow up with every student and every lead.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Hire focused AI employees for coaching admissions or general lead follow-up.
            Configure how they speak, what they may say, and when a person must take over.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#employees" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold transition hover:bg-emerald-500">
              Meet the employees <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/employees/setup" className="rounded-lg border border-slate-700 bg-slate-900/70 px-6 py-3 font-semibold text-slate-200 transition hover:border-emerald-500">
              Configure a pilot employee
            </Link>
            <a href="#client-view" className="rounded-lg border border-slate-700 bg-slate-900/70 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500">
              See the client dashboard
            </a>
          </div>
        </div>
      </section>

      <section id="employees" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Employee marketplace</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Start with one clear job</h2>
          <p className="mt-4 text-slate-400">
            These are the only two business employees in the initial release. Both begin in human-approval mode.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {employees.map(({ name, role, audience, description, icon: Icon, languages, tasks }) => (
            <article key={name} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-300"><Icon className="h-7 w-7" /></div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">Pilot</span>
              </div>
              <p className="mt-6 text-sm font-semibold text-emerald-300">{name} · {audience}</p>
              <h3 className="mt-1 text-2xl font-bold">{role}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {tasks.map((task) => (
                  <div key={task} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400" /> {task}
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-slate-800 pt-5">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Languages className="h-4 w-4" /> Language setup
                </p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <span key={language} className="rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{language}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="client-view" className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Client view preview</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">What the business owner will see</h2>
            <p className="mt-4 text-slate-400">A simple operating view focused on outcomes and items needing attention.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-6 py-4">
              <div>
                <p className="font-bold">Aarya · Admissions</p>
                <p className="text-xs text-slate-500">Demo coaching institute</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active in approval mode
              </span>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['New enquiries', '28'],
                ['Qualified students', '17'],
                ['Counselling calls', '9'],
                ['Needs attention', '3'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-6 border-t border-slate-800 p-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h3 className="font-semibold">Recent activity</h3>
                <div className="mt-4 space-y-3">
                  {[
                    ['UserCheck', 'Qualified NEET preparation enquiry', '2 min ago'],
                    ['Clock3', 'Booked counselling call for Tuesday', '8 min ago'],
                    ['Message', 'Sent approved course brochure', '14 min ago'],
                  ].map(([kind, action, time]) => (
                    <div key={action} className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                      <div className="flex items-center gap-3">
                        {kind === 'UserCheck' ? <UserCheck className="h-5 w-5 text-emerald-400" /> : kind === 'Clock3' ? <Clock3 className="h-5 w-5 text-indigo-400" /> : <MessageSquareText className="h-5 w-5 text-sky-400" />}
                        <span className="text-sm text-slate-200">{action}</span>
                      </div>
                      <span className="text-xs text-slate-500">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Needs approval</h3>
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <CircleAlert className="h-5 w-5 text-amber-400" />
                  <p className="mt-3 text-sm font-semibold">Scholarship exception</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">A student requested a discount outside the approved policy.</p>
                  <span className="mt-4 inline-block rounded-md bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950">Review request</span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">Illustrative preview; values are sample data, not live customer activity.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-20 md:grid-cols-3">
        {[
          [Languages, 'Local communication', 'English, Hindi, Hinglish, regional languages, and dialect preferences are configured per business.'],
          [ShieldCheck, 'Human control', 'Sensitive requests, low-confidence answers, and policy exceptions are sent to a person.'],
          [Users, 'Owner-friendly setup', 'Customers choose outcomes and rules instead of building technical workflows.'],
        ].map(([Icon, title, body]) => {
          const FeatureIcon = Icon as typeof Languages;
          return (
            <div key={title as string} className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <FeatureIcon className="h-7 w-7 text-emerald-400" />
              <h3 className="mt-5 text-lg font-bold">{title as string}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{body as string}</p>
            </div>
          );
        })}
      </section>

      <RegionalPricing />

      <footer className="bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-10 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-bold">AgentsHive Business</p>
            <p className="mt-1 text-sm text-slate-500">AI employees for practical business work.</p>
          </div>
          <div className="flex gap-5 text-sm font-semibold">
            <Link href="/" className="text-slate-300 hover:text-white">Choose experience</Link>
            <Link href="/agents" className="text-indigo-300 hover:text-indigo-200">Explore AI Agents</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
