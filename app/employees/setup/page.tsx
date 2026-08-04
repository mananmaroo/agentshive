'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { BookOpenCheck, Check, ExternalLink, Loader2, Phone, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { supabaseAnon } from '@/app/lib/supabase-anon';

type ImportedPage = { url: string; title: string; content: string; wordCount: number };
type SetupStep = 'knowledge' | 'phone' | 'complete';
const PHONE_SAVE_TIMEOUT_MS = 12000;

const normalizeE164 = (value: string) => {
  const compact = value.trim().replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(compact) ? compact : null;
};

export default function EmployeeSetupPage() {
  const { user, loading } = useAuth();
  const [website, setWebsite] = useState('https://aarohan-university-demo.vercel.app');
  const [instituteName, setInstituteName] = useState('Aarohan University Demo');
  const [pages, setPages] = useState<ImportedPage[]>([]);
  const [rootUrl, setRootUrl] = useState('');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [step, setStep] = useState<SetupStep>('knowledge');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const importWebsite = async (event: FormEvent) => {
    event.preventDefault();
    setImporting(true);
    setError('');
    setNotice('');
    try {
      const { data } = await supabaseAnon.auth.getSession();
      if (!data.session?.access_token) throw new Error('Your session has expired. Please sign in again.');
      const response = await fetch('/api/business/knowledge/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ website }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Website import failed.');
      if (!result.pages?.length) throw new Error('No usable public pages were found. Check the website address and try again.');
      setPages(result.pages);
      setRootUrl(result.rootUrl);
      setNotice(`Found ${result.pages.length} public pages. Review them, then approve the knowledge.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Website import failed.');
    } finally {
      setImporting(false);
    }
  };

  const approveKnowledge = async () => {
    if (!user) { setError('Please sign in before approving knowledge.'); return; }
    if (!pages.length || !rootUrl) { setError('Import at least one website page before approving knowledge.'); return; }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const { data: orgId, error: organizationError } = await supabaseAnon.rpc('business_ensure_organization', {
        p_name: instituteName.trim() || 'Unnamed institute',
        p_root_url: rootUrl,
      });
      if (organizationError || !orgId) throw organizationError || new Error('Could not prepare the organization workspace.');

      const { error: knowledgeError } = await supabaseAnon.from('business_approved_knowledge').upsert(
        pages.map((page) => ({
          organization_id: orgId,
          source_url: page.url,
          title: page.title,
          content: page.content,
          approved: true,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'organization_id,source_url' }
      );
      if (knowledgeError) throw knowledgeError;

      setOrganizationId(orgId);
      setStep('phone');
      setNotice('Knowledge approved. Aarya can now answer from these sources. Continue with optional phone readiness.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save approved knowledge. Nothing was activated.');
    } finally {
      setSaving(false);
    }
  };

  const savePhoneReadiness = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const normalized = normalizeE164(phoneNumber);
    if (!organizationId) { setError('Approve website knowledge before saving phone readiness.'); return; }
    if (!normalized) { setError('Enter a valid international number, such as +14155552671.'); return; }
    setSavingPhone(true);
    let timeoutId: number | undefined;
    try {
      const saveRequest = Promise.resolve(supabaseAnon.rpc('business_save_voice_readiness', {
        p_organization_id: organizationId,
        p_phone_e164: normalized,
      }));
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(
          () => reject(new Error('Saving took too long. Nothing was activated. Please retry, skip this step, or refresh the page.')),
          PHONE_SAVE_TIMEOUT_MS
        );
      });
      const { error: phoneError } = await Promise.race([saveRequest, timeout]);
      if (phoneError) throw phoneError;

      setPhoneNumber(normalized);
      setStep('complete');
      setNotice('Phone readiness saved. Voice is not active: no number was purchased, verified, called, or connected to a carrier.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save phone readiness. No telephone service was activated.');
    } finally {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      setSavingPhone(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-slate-950 p-10 text-slate-400">Loading setup…</main>;
  if (!user) return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white"><section className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-emerald-400" /><h1 className="mt-5 text-2xl font-bold">Sign in to configure an employee</h1><p className="mt-3 text-slate-400">Your business account protects institute knowledge and channel settings.</p><Link href="/employees/login" className="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500">Business login</Link></section></main>;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap gap-5 text-sm font-semibold"><Link href="/employees" className="text-emerald-300 hover:text-emerald-200">← Back to AI Employees</Link><Link href="/employees/dashboard" className="text-indigo-300 hover:text-indigo-200">Open client dashboard →</Link></div>
        <div className="mt-6 max-w-3xl"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Employee setup · pilot</p><h1 className="mt-3 text-4xl font-bold">Prepare Aarya for an institute</h1><p className="mt-4 leading-7 text-slate-400">Approve website knowledge, then optionally save an existing international phone number for future voice readiness. Saving never activates telephony.</p></div>

        <ol className="mt-8 flex gap-3 text-sm" aria-label="Setup progress">
          {(['knowledge','phone','complete'] as SetupStep[]).map((item,index)=><li key={item} className={`rounded-full border px-3 py-1.5 ${step===item?'border-emerald-400 bg-emerald-500/10 text-emerald-200':'border-slate-800 text-slate-500'}`}>{index+1}. {item==='knowledge'?'Knowledge':item==='phone'?'Phone readiness':'Complete'}</li>)}
        </ol>
        <div aria-live="polite">{error && <p className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</p>}{notice && <p className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{notice}</p>}</div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
            <div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-300"><BookOpenCheck className="h-6 w-6" /></div><div><h2 className="text-xl font-bold">Website knowledge</h2><p className="text-sm text-slate-500">Public pages only · maximum 10 pages</p></div></div>
            <form onSubmit={importWebsite} className="mt-7 space-y-5"><label className="block text-sm font-semibold">Institute name<input value={instituteName} onChange={(event)=>setInstituteName(event.target.value)} disabled={saving} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-normal outline-none focus:border-emerald-500 disabled:opacity-60" /></label><label className="block text-sm font-semibold">Public website address<input value={website} onChange={(event)=>setWebsite(event.target.value)} inputMode="url" disabled={saving} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-normal outline-none focus:border-emerald-500 disabled:opacity-60" /></label><button disabled={importing||saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">{importing?<Loader2 className="h-4 w-4 animate-spin" />:<RefreshCw className="h-4 w-4" />}{importing?'Reading public pages…':'Import website'}</button></form>
            {pages.length>0 && <div className="mt-7"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">Review imported sources</h3><button type="button" onClick={approveKnowledge} disabled={saving||step!=='knowledge'} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">{saving?<Loader2 className="h-4 w-4 animate-spin" />:<Check className="h-4 w-4" />}{saving?'Saving approval…':step==='knowledge'?'Approve and continue':'Knowledge approved'}</button></div><div className="mt-4 space-y-3">{pages.map((page)=><article key={page.url} className="rounded-xl border border-slate-800 bg-slate-950 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-slate-200">{page.title||'Untitled page'}</p><p className="mt-1 text-xs text-slate-500">{page.wordCount.toLocaleString()} words</p></div><a href={page.url} target="_blank" rel="noreferrer" aria-label="Open source page" className="text-slate-500 hover:text-emerald-300"><ExternalLink className="h-4 w-4" /></a></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{page.content}</p></article>)}</div></div>}
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"><div className="flex items-center gap-3"><Phone className="h-6 w-6 text-indigo-400" /><h2 className="text-xl font-bold">Phone readiness</h2></div><span className="mt-5 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">{step==='complete'?'Configuration saved · not active':step==='phone'?'Ready to configure · not active':'Complete knowledge first'}</span><form onSubmit={savePhoneReadiness} className="mt-5"><label className="block text-sm font-semibold">Existing international number<input value={phoneNumber} onChange={(event)=>setPhoneNumber(event.target.value)} placeholder="+14155552671" inputMode="tel" disabled={step==='knowledge'||savingPhone||step==='complete'} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-normal outline-none focus:border-indigo-500 disabled:opacity-60" /></label><p className="mt-2 text-xs leading-5 text-slate-500">Use E.164 format: +, country code, and number. US example: +14155552671.</p><button disabled={step!=='phone'||savingPhone} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">{savingPhone?<Loader2 className="h-4 w-4 animate-spin" />:<Check className="h-4 w-4" />}{savingPhone?'Saving configuration…':step==='complete'?'Configuration saved':'Save phone readiness'}</button></form><button type="button" onClick={()=>{setStep('complete');setNotice('Phone readiness skipped. You can configure it later; voice remains inactive.');}} disabled={step!=='phone'||savingPhone} className="mt-3 w-full text-sm text-slate-400 hover:text-white disabled:hidden">Skip for now</button><p className="mt-5 border-t border-slate-800 pt-5 text-xs leading-5 text-slate-500">This only stores readiness configuration. It does not purchase, provision, verify, call, forward, or connect a telephone service.</p></section>
            {step==='complete' && <Link href="/employees/dashboard" className="block rounded-xl bg-emerald-600 px-5 py-4 text-center font-semibold hover:bg-emerald-500">Continue to client dashboard →</Link>}
            <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6"><ShieldCheck className="h-6 w-6 text-emerald-400" /><h3 className="mt-4 font-bold">Approval-first operation</h3><p className="mt-2 text-sm leading-6 text-slate-400">Aarya answers institutional facts only from approved sources and sends unsupported questions to a person.</p></section>
          </aside>
        </div>
      </div>
    </main>
  );
}
