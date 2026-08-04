import Link from 'next/link';
import RegionalPricing from './RegionalPricing';
import { BUSINESS_SOLUTIONS, SOLUTION_GROUPS, STATUS_LABELS, type SolutionStatus } from './catalog';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Bot,
  Check,
  CircleAlert,
  Clock3,
  Languages,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';



function statusClass(status: SolutionStatus) {
  if (status === 'controlled_pilot') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  if (status === 'consultation_available') return 'border-sky-500/30 bg-sky-500/10 text-sky-200';
  if (status === 'custom_build') return 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200';
  return 'border-amber-500/30 bg-amber-500/10 text-amber-200';
}

export default function EmployeesMarketplacePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4" aria-label="Business navigation">
          <Link href="/" className="inline-flex min-w-0 items-center gap-2 font-bold">
            <Bot className="h-6 w-6 shrink-0 text-emerald-400" />
            <span className="truncate">AgentsHive Business</span>
          </Link>
          <div className="hidden items-center gap-5 text-sm font-semibold md:flex">
            <a href="#employees" className="text-slate-300 hover:text-white">Employees</a>
            <a href="#pricing" className="text-slate-300 hover:text-white">Pricing</a>
            <Link href="/employees/demo" className="text-cyan-300 hover:text-cyan-200">Guided demo</Link>
            <Link href="/employees/custom" className="text-slate-300 hover:text-white">Request a solution</Link>
            <Link href="/employees/waitlist" className="text-emerald-300 hover:text-emerald-200">Join waitlist</Link>
            <Link href="/employees/login" className="text-emerald-300 hover:text-emerald-200">Business login</Link>
            <Link href="/registry/home" className="text-indigo-300 hover:text-indigo-200">Agent Registry</Link>
          </div>
          <details className="group relative md:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 marker:content-none">
              <Menu className="h-4 w-4" /> Menu
            </summary>
            <div className="absolute right-0 top-12 z-50 flex w-56 flex-col rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm font-semibold shadow-2xl">
              <a href="#employees" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">Employees</a>
              <a href="#pricing" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">Pricing</a>
              <Link href="/employees/demo" className="rounded-lg px-3 py-2 text-cyan-300 hover:bg-slate-800">Guided demo</Link>
              <Link href="/employees/custom" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">Request a solution</Link>
              <Link href="/employees/waitlist" className="rounded-lg px-3 py-2 text-emerald-300 hover:bg-slate-800">Join waitlist</Link>
              <Link href="/employees/login" className="rounded-lg px-3 py-2 text-emerald-300 hover:bg-slate-800">Business login</Link>
              <Link href="/registry/home" className="rounded-lg px-3 py-2 text-indigo-300 hover:bg-slate-800">Agent Registry</Link>
            </div>
          </details>
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
            Start with a measurable workflow, then configure the knowledge, systems, languages and human controls it needs.
            Every unbuilt capability is scoped through consultation before we make a delivery promise.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#employees" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold transition hover:bg-emerald-500">
              Explore solutions <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/employees/demo" className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-6 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-500/20">
              Try the social media demo
            </Link>
            <Link href="/embed/admissions-demo" className="rounded-lg border border-slate-700 bg-slate-900/70 px-6 py-3 font-semibold text-slate-200 transition hover:border-emerald-500">
              Open Aarya admissions demo
            </Link>
            <a href="#client-view" className="rounded-lg border border-slate-700 bg-slate-900/70 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500">
              See the client dashboard
            </a>
          </div>
        </div>
      </section>

      <section id="employees" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Consultation-led AI solutions</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Choose the outcome you want to improve</h2>
          <p className="mt-4 leading-7 text-slate-400">
            Aarya is available as a controlled website pilot. Other solutions are consultation-led custom builds unless marked Coming later.
            WhatsApp workflows are provider-neutral and inactive until approved provider access is configured. Phone and voice appear last because live calling is not ready.
          </p>
        </div>
        <div className="space-y-14">
          {SOLUTION_GROUPS.map((group) => {
            const groupSolutions = BUSINESS_SOLUTIONS.filter((solution) => solution.group === group);
            const groupId = `solution-group-${group.replaceAll(' ', '-').toLowerCase()}`;
            return (
              <section key={group} aria-labelledby={groupId}>
                <h3 id={groupId} className="text-xl font-bold text-slate-200">{group}</h3>
                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {groupSolutions.map((solution) => (
                    <article key={solution.slug} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-300"><Bot className="h-6 w-6" /></div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(solution.status)}`}>{STATUS_LABELS[solution.status]}</span>
                      </div>
                      <h4 className="mt-5 text-xl font-bold">{solution.name}</h4>
                      <p className="mt-2 text-sm font-semibold text-emerald-300">{solution.outcome}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{solution.description}</p>
                      <div className="mt-5 space-y-2">
                        {solution.examples.map((example) => <p key={example} className="flex items-center gap-2 text-sm text-slate-300"><Check className="h-4 w-4 text-emerald-400" /> {example}</p>)}
                      </div>
                      <p className="mt-5 border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">{solution.availability}</p>
                      <Link href={solution.slug === 'social-media-automation' ? '/employees/demo' : `/employees/custom?solution=${solution.slug}`} className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-emerald-500 hover:text-white">
                        {solution.slug === 'social-media-automation' ? 'Try guided demo' : solution.status === 'coming_later' ? 'Register future interest' : 'Request consultation'} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
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
            <Link href="/registry/home" className="text-indigo-300 hover:text-indigo-200">Explore AI Agents</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
