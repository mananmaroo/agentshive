'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CircleAlert, Loader2, MessageSquareText, UserCheck } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { supabaseAnon } from '@/app/lib/supabase-anon';

type Conversation = { id: string; status: string; channel: string; visitor_name: string | null; last_message_at: string };
type Lead = { id: string; name: string | null; email: string | null; phone: string | null; status: string; created_at: string };
type Attention = { id: string; reason: string; status: string; created_at: string };

export default function EmployeeDashboardPage() {
  const { user, loading } = useAuth();
  const [organization, setOrganization] = useState<{ id: string; name: string } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [attention, setAttention] = useState<Attention[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: membership, error: membershipError } = await supabaseAnon.from('business_organization_members').select('organization_id, business_organizations(id,name)').limit(1).maybeSingle();
      if (membershipError) { setError(membershipError.message); return; }
      const raw = membership?.business_organizations as unknown as { id: string; name: string } | null;
      if (!raw) return;
      setOrganization(raw);
      const [conversationResult, leadResult, attentionResult] = await Promise.all([
        supabaseAnon.from('business_conversations').select('id,status,channel,visitor_name,last_message_at').eq('organization_id', raw.id).order('last_message_at', { ascending: false }).limit(25),
        supabaseAnon.from('business_leads').select('id,name,email,phone,status,created_at').eq('organization_id', raw.id).order('created_at', { ascending: false }).limit(25),
        supabaseAnon.from('business_attention_items').select('id,reason,status,created_at').eq('organization_id', raw.id).eq('status', 'open').order('created_at', { ascending: false }).limit(25),
      ]);
      if (conversationResult.error || leadResult.error || attentionResult.error) setError(conversationResult.error?.message || leadResult.error?.message || attentionResult.error?.message || 'Dashboard failed to load.');
      setConversations((conversationResult.data || []) as Conversation[]); setLeads((leadResult.data || []) as Lead[]); setAttention((attentionResult.data || []) as Attention[]);
    };
    void load();
  }, [user]);

  if (loading) return <main className="min-h-screen bg-slate-950 p-10 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /></main>;
  if (!user) return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white"><Link href="/employees/login" className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold">Business login</Link></main>;

  return <main className="min-h-screen bg-slate-950 px-4 py-10 text-white"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">Client workspace</p><h1 className="mt-2 text-3xl font-bold">{organization?.name || 'Set up your institute'}</h1></div><Link href="/employees/setup" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold">Knowledge settings</Link></div>{error && <p className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</p>}<div className="mt-8 grid gap-4 sm:grid-cols-3">{[[MessageSquareText,'Conversations',conversations.length],[UserCheck,'Leads',leads.length],[CircleAlert,'Needs attention',attention.length]].map(([Icon,label,value]) => { const I=Icon as typeof MessageSquareText; return <div key={label as string} className="rounded-xl border border-slate-800 bg-slate-900 p-5"><I className="h-5 w-5 text-emerald-400"/><p className="mt-4 text-sm text-slate-400">{label as string}</p><p className="mt-1 text-3xl font-bold">{value as number}</p></div>; })}</div><div className="mt-8 grid gap-6 lg:grid-cols-3"><section className="rounded-xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2"><h2 className="font-bold">Recent conversations</h2><div className="mt-4 space-y-3">{conversations.length ? conversations.map((item)=><div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4"><div><p className="text-sm font-semibold">{item.visitor_name || 'Website visitor'}</p><p className="text-xs text-slate-500">{item.channel} · {item.status}</p></div><time className="text-xs text-slate-500">{new Date(item.last_message_at).toLocaleString()}</time></div>) : <p className="text-sm text-slate-500">No live conversations yet.</p>}</div></section><section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5"><h2 className="font-bold">Human attention</h2><div className="mt-4 space-y-3">{attention.length ? attention.map((item)=><div key={item.id} className="rounded-lg border border-amber-500/20 p-3 text-sm text-slate-300">{item.reason}</div>) : <p className="text-sm text-slate-500">Nothing currently needs review.</p>}</div></section></div><section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-bold">Captured leads</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{leads.length ? leads.map((lead)=><div key={lead.id} className="rounded-lg border border-slate-800 bg-slate-950 p-4"><p className="font-semibold">{lead.name || lead.email || lead.phone || 'Unidentified lead'}</p><p className="mt-1 text-xs text-slate-500">{lead.email || lead.phone} · {lead.status}</p></div>) : <p className="text-sm text-slate-500">No contact details captured yet.</p>}</div></section></div></main>;
}
