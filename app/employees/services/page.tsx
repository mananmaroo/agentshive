/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bot, Boxes, FileText, Globe2, Mic2, Workflow } from 'lucide-react';
import { SERVICE_PAGES } from './service-data';

export const metadata: Metadata = {
  title: 'Custom Business Software & AI Automation Services USA',
  description: 'AgentsHive Business scopes custom software, websites, automation, AI applications and voice workflows for US businesses.',
  alternates: { canonical: '/employees/services' },
  openGraph: { title: 'Custom Business Software & AI Automation Services USA', description: 'Consultation-led software, automation and AI services for US businesses.', url: '/employees/services', type: 'website' },
};

const icons = [FileText, Boxes, Workflow, Bot, Mic2, Globe2];

export default function ServicesPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'AgentsHive Business services', itemListElement: SERVICE_PAGES.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://agentshive.net/employees/services/${s.slug}`, name: s.h1 })) };
  return <main className="min-h-screen bg-slate-950 text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="border-b border-slate-800"><nav aria-label="Business navigation" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4"><Link href="/employees" className="font-bold text-emerald-300">AgentsHive Business</Link><div className="flex gap-5 text-sm font-semibold"><Link href="/employees/custom" className="text-white">Request consultation</Link><Link href="/registry/home" className="text-indigo-300">AI Agent Registry</Link></div></nav></header>
    <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,#064e3b_0%,#020617_55%)]"><div className="mx-auto max-w-7xl px-4 py-20"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">US business services</p><h1 className="mt-4 max-w-4xl text-4xl font-bold sm:text-6xl">Custom business software, automation and AI employees</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">AgentsHive Business designs scoped systems around your actual workflow—from billing and inventory software to connected automation, websites, applications and AI-assisted operations.</p><Link href="/employees/custom" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold">Request a scoped consultation <ArrowRight className="h-4 w-4" /></Link></div></section>
    <section className="mx-auto max-w-7xl px-4 py-16"><div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-6 text-slate-300">Services are designed and built after discovery. Examples describe possible scope, not preconfigured features or completed client deployments.</div><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{SERVICE_PAGES.map((service, index) => { const Icon=icons[index%icons.length]; return <article key={service.slug} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"><Icon className="h-7 w-7 text-emerald-400" aria-hidden="true"/><h2 className="mt-5 text-xl font-bold">{service.h1}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{service.summary}</p><Link href={`/employees/services/${service.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">Explore service <ArrowRight className="h-4 w-4"/></Link></article>})}</div></section>
  </main>;
}
