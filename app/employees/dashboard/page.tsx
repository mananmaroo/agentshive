'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CircleAlert, Loader2, LogOut, MessageSquareText, RefreshCw, UserCheck } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { supabaseAnon } from '@/app/lib/supabase-anon';

type Organization = { id: string; name: string; root_url: string; status: string; voice_status: string };
type Conversation = { id: string; status: string; channel: string; visitor_name: string | null; last_message_at: string };
type Lead = { id: string; name: string | null; email: string | null; phone: string | null; status: string; created_at: string };
type Attention = { id: string; reason: string; status: string; created_at: string };

export default function EmployeeDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [attention, setAttention] = useState<Attention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    setAccessDenied(false);

    try {
      const { data: membership, error: membershipError } = await supabaseAnon
        .from('business_organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError) throw membershipError;
      if (!membership?.organization_id) {
        setOrganization(null);
        setConversations([]);
        setLeads([]);
        setAttention([]);
        setError('Business access is inactive, unpaid, revoked, expired, or not linked to this account.');
        setAccessDenied(true);
        return;
      }

      const organizationId = membership.organization_id;
      const [organizationResult, conversationResult, leadResult, attentionResult] = await Promise.all([
        supabaseAnon
          .from('business_organizations')
          .select('id,name,root_url,status,voice_status')
          .eq('id', organizationId)
          .single(),
        supabaseAnon
          .from('business_conversations')
          .select('id,status,channel,visitor_name,last_message_at')
          .eq('organization_id', organizationId)
          .order('last_message_at', { ascending: false })
          .limit(25),
        supabaseAnon
          .from('business_leads')
          .select('id,name,email,phone,status,created_at')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(25),
        supabaseAnon
          .from('business_attention_items')
          .select('id,reason,status,created_at')
          .eq('organization_id', organizationId)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(25),
      ]);

      const firstError = organizationResult.error || conversationResult.error || leadResult.error || attentionResult.error;
      if (firstError) throw firstError;

      setOrganization(organizationResult.data as Organization);
      setConversations((conversationResult.data || []) as Conversation[]);
      setLeads((leadResult.data || []) as Lead[]);
      setAttention((attentionResult.data || []) as Attention[]);
    } catch (loadError) {
      setAccessDenied(true);
      setError(loadError instanceof Error ? loadError.message : 'Dashboard failed to load.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const logout = async () => {
    setError('');
    try {
      await signOut();
      window.location.replace('/employees/login');
    } catch {
      setError('Could not log out. Please try again.');
    }
  };

  if (authLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" aria-label="Loading dashboard" /></main>;
  }

  if (loading && user && !organization && !error) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300"><div className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-400" aria-label="Loading employee dashboard" /><p className="mt-3 text-sm">Loading your employee dashboard…</p></div></main>;
  }

  if (!user) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white"><div className="text-center"><h1 className="text-2xl font-bold">Business login required</h1><p className="mt-2 text-slate-400">Sign in to view your employee workspace.</p><Link href="/employees/login" className="mt-6 inline-flex rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500">Business login</Link></div></main>;
  }

  if (accessDenied) return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white"><section className="max-w-lg rounded-2xl border border-rose-500/30 bg-slate-900 p-8 text-center"><h1 className="text-2xl font-bold">Workspace access unavailable</h1><p role="alert" className="mt-3 text-slate-300">{error}</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={() => void logout()} className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500">Use another account</button><Link href="/employees" className="rounded-lg border border-slate-700 px-5 py-3 font-semibold">Return to AgentsHive Business</Link></div></section></main>;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/employees" className="font-semibold text-emerald-300 hover:text-emerald-200">AgentsHive Business</Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/employees/setup" className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:border-slate-500 hover:text-white">Knowledge settings</Link>
            <button onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:border-slate-500 hover:text-white"><LogOut className="h-4 w-4" /> Log out</button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">Client workspace</p>
            <h1 className="mt-2 text-3xl font-bold">{organization?.name || 'Employee dashboard'}</h1>
            <p className="mt-2 text-sm text-slate-400">Only data belonging to your business workspace is shown here.</p>
          </div>
          <button onClick={() => void loadDashboard()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
        </div>

        {error && <p role="alert" className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</p>}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[[MessageSquareText, 'Conversations', conversations.length], [UserCheck, 'Leads', leads.length], [CircleAlert, 'Needs attention', attention.length]].map(([Icon, label, value]) => { const IconComponent = Icon as typeof MessageSquareText; return <div key={label as string} className="rounded-xl border border-slate-800 bg-slate-900 p-5"><IconComponent className="h-5 w-5 text-emerald-400" /><p className="mt-4 text-sm text-slate-400">{label as string}</p><p className="mt-1 text-3xl font-bold">{value as number}</p></div>; })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2"><h2 className="font-bold">Recent conversations</h2><div className="mt-4 space-y-3">{conversations.length ? conversations.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4"><div><p className="text-sm font-semibold">{item.visitor_name || 'Website visitor'}</p><p className="text-xs text-slate-500">{item.channel} · {item.status}</p></div><time className="text-right text-xs text-slate-500">{new Date(item.last_message_at).toLocaleString()}</time></div>) : <p className="text-sm text-slate-500">No live conversations yet.</p>}</div></section>
          <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5"><h2 className="font-bold">Human attention</h2><div className="mt-4 space-y-3">{attention.length ? attention.map((item) => <div key={item.id} className="rounded-lg border border-amber-500/20 p-3 text-sm text-slate-300">{item.reason}</div>) : <p className="text-sm text-slate-500">Nothing currently needs review.</p>}</div></section>
        </div>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-bold">Captured leads</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{leads.length ? leads.map((lead) => <div key={lead.id} className="rounded-lg border border-slate-800 bg-slate-950 p-4"><p className="font-semibold">{lead.name || lead.email || lead.phone || 'Unidentified lead'}</p><p className="mt-1 text-xs text-slate-500">{[lead.email, lead.phone, lead.status].filter(Boolean).join(' · ')}</p></div>) : <p className="text-sm text-slate-500">No contact details captured yet.</p>}</div></section>
      </div>
    </main>
  );
}
