import Link from 'next/link';
import { ArrowRight, Briefcase, Zap } from 'lucide-react';
import { OAuthLandingGuard } from '@/app/components/oauth-landing-guard';

export default function ExperienceSelector() {
  return (
    <OAuthLandingGuard>
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="grid min-h-[82vh] lg:grid-cols-2">
        <Link
          href="/registry/home"
          className="group flex min-h-[420px] flex-col justify-between border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,#312e81_0%,#020617_56%)] p-8 transition-colors hover:bg-slate-900 sm:p-14 lg:border-b-0 lg:border-r"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
              <Zap className="h-4 w-4" />
              Free community registry
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-bold leading-tight sm:text-6xl">
              Explore AI Agents
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Discover ready-made agents for ChatGPT, Claude, and other AI tools. Copy one,
              customise it, and put it to work.
            </p>
          </div>
          <span className="mt-10 inline-flex items-center gap-2 text-lg font-semibold text-indigo-300">
            Enter the agent registry
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/employees"
          className="group flex min-h-[420px] flex-col justify-between bg-[radial-gradient(circle_at_top_right,#064e3b_0%,#020617_56%)] p-8 transition-colors hover:bg-slate-900 sm:p-14"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              <Briefcase className="h-4 w-4" />
              Built for businesses
            </div>
            <h2 className="mt-8 max-w-xl text-4xl font-bold leading-tight sm:text-6xl">
              Hire AI Employees
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Meet AI employees for coaching admissions and everyday lead follow-up—designed
              for English, Hindi, Hinglish, and local language preferences.
            </p>
          </div>
          <span className="mt-10 inline-flex items-center gap-2 text-lg font-semibold text-emerald-300">
            Explore business employees
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/40 px-4 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-semibold">One AgentsHive, two focused experiences.</p>
            <p className="mt-1 text-sm text-slate-400">
              This selection page always stays at agentshive.net, even when you are signed in.
            </p>
          </div>
          <div className="flex gap-5 text-sm font-semibold">
            <Link href="/registry/home" className="text-indigo-300 hover:text-indigo-200">Agent Registry</Link>
            <Link href="/employees" className="text-emerald-300 hover:text-emerald-200">AI Employees</Link>
          </div>
        </div>
      </section>
    </main>
    </OAuthLandingGuard>
  );
}
