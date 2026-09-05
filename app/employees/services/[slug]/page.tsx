import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, ChevronRight, ShieldCheck } from 'lucide-react';
import { getService, SERVICE_PAGES } from '../service-data';

export function generateStaticParams() { return SERVICE_PAGES.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const service=getService((await params).slug); if(!service) return {};
  const url=`/employees/services/${service.slug}`;
  return { title: service.title, description: service.description, alternates:{canonical:url}, robots:{index:true,follow:true}, openGraph:{title:service.title,description:service.description,url,type:'website'} };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug:string }> }) {
  const service=getService((await params).slug); if(!service) notFound();
  const url=`https://agentshive.net/employees/services/${service.slug}`;
  const jsonLd=[
    {'@context':'https://schema.org','@type':'Service',name:service.h1,serviceType:service.h1,provider:{'@type':'Organization',name:'AgentsHive',url:'https://agentshive.net'},areaServed:{'@type':'Country',name:'United States'},url,description:service.description},
    {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'AgentsHive Business',item:'https://agentshive.net/employees'},
      {'@type':'ListItem',position:2,name:'Services',item:'https://agentshive.net/employees/services'},
      {'@type':'ListItem',position:3,name:service.h1,item:url},
    ]},
  ];
  const related=service.related.map(getService).filter(Boolean);
  return <main className="min-h-screen bg-slate-950 text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <nav aria-label="Breadcrumb" className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-5 text-sm text-slate-400"><Link href="/employees">Business</Link><ChevronRight className="h-4 w-4"/><Link href="/employees/services">Services</Link><ChevronRight className="h-4 w-4"/><span className="truncate text-slate-200">{service.h1}</span></nav>
    <section className="border-y border-slate-800 bg-[radial-gradient(circle_at_top,#064e3b_0%,#020617_55%)]"><div className="mx-auto max-w-6xl px-4 py-20"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Consultation-led service for US businesses</p><h1 className="mt-4 max-w-4xl text-4xl font-bold sm:text-6xl">{service.h1}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{service.summary}</p><Link href={`/employees/custom?solution=${service.solution}`} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold">Request consultation <ArrowRight className="h-4 w-4"/></Link></div></section>
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
      <section><h2 className="text-2xl font-bold">Problems this service can address</h2><ul className="mt-5 space-y-3">{service.problems.map(x=><li key={x} className="flex gap-3 text-slate-300"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400"/>{x}</li>)}</ul></section>
      <section><h2 className="text-2xl font-bold">Common workflow scope</h2><ul className="mt-5 space-y-3">{service.workflows.map(x=><li key={x} className="flex gap-3 text-slate-300"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400"/>{x}</li>)}</ul></section>
      <section><h2 className="text-2xl font-bold">Possible deliverables</h2><ul className="mt-5 space-y-3">{service.deliverables.map(x=><li key={x} className="flex gap-3 text-slate-300"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400"/>{x}</li>)}</ul></section>
      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6"><ShieldCheck className="h-7 w-7 text-emerald-400"/><h2 className="mt-4 text-2xl font-bold">Controls and safeguards</h2><ul className="mt-5 space-y-3">{service.safeguards.map(x=><li key={x} className="text-sm leading-6 text-slate-300">{x}</li>)}</ul></section>
    </div>
    <section className="border-y border-slate-800 bg-slate-900/40"><div className="mx-auto max-w-6xl px-4 py-14"><h2 className="text-2xl font-bold">Related AgentsHive Business services</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{related.map(r=>r&&<Link key={r.slug} href={`/employees/services/${r.slug}`} className="rounded-xl border border-slate-700 p-5 font-semibold hover:border-emerald-500">{r.h1}</Link>)}</div><p className="mt-8 text-sm text-slate-400">Looking for reusable community agent templates instead? <Link href="/registry/home" className="text-indigo-300">Explore AgentsHive Registry</Link>.</p></div></section>
    <section className="mx-auto max-w-4xl px-4 py-16 text-center"><h2 className="text-3xl font-bold">Start with your workflow</h2><p className="mt-4 text-slate-400">Features, integrations, controls, commercial terms and delivery scope are agreed before implementation.</p><Link href={`/employees/custom?solution=${service.solution}`} className="mt-7 inline-flex rounded-xl bg-emerald-600 px-6 py-3 font-semibold">Request a scoped consultation</Link></section>
  </main>;
}
