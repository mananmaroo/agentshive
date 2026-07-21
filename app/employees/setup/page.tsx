'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { BookOpenCheck, Check, ExternalLink, Loader2, Phone, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { supabaseAnon } from '@/app/lib/supabase-anon';

type ImportedPage = { url: string; title: string; content: string; wordCount: number };

export default function EmployeeSetupPage() {
  const { user, loading } = useAuth();
  const [website, setWebsite] = useState('https://aarohan-university-demo.vercel.app');
  const [instituteName, setInstituteName] = useState('Aarohan University Demo');
  const [pages, setPages] = useState<ImportedPage[]>([]);
  const [rootUrl, setRootUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const importWebsite = async (event: FormEvent) => {
    event.preventDefault();
    setImporting(true);
    setError('');
    setNotice('');
    try {
      const { data } = await supabaseAnon.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Please sign in to import and approve website knowledge.');
      const response = await fetch('/api/business/knowledge/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ website }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Website import failed.');
      setPages(result.pages);
      setRootUrl(result.rootUrl);
      setNotice(`Found ${result.pages.length} public pages. Review them before publishing.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Website import failed.');
    } finally {
      setImporting(false);
    }
  };

  const approveKnowledge = async () => {
    if (!user || !pages.length) return;
    setSaving(true);
    setError('');
    try {
      const { data: source, error: sourceError } = await supabaseAnon
        .from('business_knowledge_sources')
        .insert({
          owner_id: user.id,
          institute_name: instituteName.trim() || 'Unnamed institute',
          root_url: rootUrl,
          status: 'approved',
          page_count: pages.length,
          last_imported_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (sourceError) throw sourceError;

      const { error: pagesError } = await supabaseAnon.from('business_knowledge_pages').insert(
        pages.map((page) => ({
          source_id: source.id,
          owner_id: user.id,
          source_url: page.url,
          title: page.title,
          content: page.content,
          word_count: page.wordCount,
          approved: true,
        }))
      );
      if (pagesError) throw pagesError;
      setNotice('Knowledge approved and saved. Aarya can use these sourced pages once the runtime connection is enabled.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the approved knowledge.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-slate-950 p-10 text-slate-400">Loading setup…</main>;

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <section className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400" />
          <h1 className="mt-5 text-2xl font-bold">Sign in to configure an employee</h1>
          <p className="mt-3 text-slate-400">The same AgentsHive account protects institute knowledge and channel settings.</p>
          <Link href="/employees/login" className="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500">Sign in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/employees" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">← Back to AI Employees</Link>
        <div className="mt-6 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Employee setup · pilot</p>
          <h1 className="mt-3 text-4xl font-bold">Prepare Aarya for an institute</h1>
          <p className="mt-4 leading-7 text-slate-400">Import approved website knowledge now. Telephone activation remains locked until you provide the existing number and carrier.</p>
        </div>

        <div className="mt-10 grid gap-7 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-300"><BookOpenCheck className="h-6 w-6" /></div>
              <div><h2 className="text-xl font-bold">Website knowledge importer</h2><p className="text-sm text-slate-500">Public pages only · maximum 10 pages in this pilot</p></div>
            </div>

            <form onSubmit={importWebsite} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold">Institute name
                <input value={instituteName} onChange={(event) => setInstituteName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-normal outline-none focus:border-emerald-500" />
              </label>
              <label className="block text-sm font-semibold">Public website address
                <input value={website} onChange={(event) => setWebsite(event.target.value)} inputMode="url" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-normal outline-none focus:border-emerald-500" />
              </label>
              <button disabled={importing} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500 disabled:opacity-60">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {importing ? 'Reading public pages…' : 'Import website'}
              </button>
            </form>

            {error && <p className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</p>}
            {notice && <p className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{notice}</p>}

            {pages.length > 0 && (
              <div className="mt-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold">Review imported sources</h3>
                  <button onClick={approveKnowledge} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve and save
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {pages.map((page) => (
                    <article key={page.url} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div><p className="font-semibold text-slate-200">{page.title || 'Untitled page'}</p><p className="mt-1 text-xs text-slate-500">{page.wordCount.toLocaleString()} words</p></div>
                        <a href={page.url} target="_blank" rel="noreferrer" aria-label="Open source page" className="text-slate-500 hover:text-emerald-300"><ExternalLink className="h-4 w-4" /></a>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{page.content}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-center gap-3"><Phone className="h-6 w-6 text-indigo-400" /><h2 className="text-xl font-bold">Existing phone number</h2></div>
              <span className="mt-5 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">Awaiting number and carrier</span>
              <div className="mt-6 space-y-4 text-sm text-slate-400">
                {['Confirm forwarding or SIP support', 'Connect inbound call webhook', 'Add English, Hindi and dialect tests', 'Set human transfer and spending limits'].map((step, index) => (
                  <div key={step} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-300">{index + 1}</span><span>{step}</span></div>
                ))}
              </div>
              <p className="mt-6 border-t border-slate-800 pt-5 text-xs leading-5 text-slate-500">No telephone provider, number or paid speech service has been activated.</p>
            </section>
            <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <h3 className="mt-4 font-bold">Approval-first knowledge</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">Aarya will answer institutional facts only from approved sources and hand unsupported questions to a person.</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
