'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Clock3, CreditCard, Loader2, RefreshCw, ShieldAlert, UserPlus } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { supabaseAnon } from '@/app/lib/supabase-anon';

type Organization = {
  id: string; name: string; root_url: string; employee_type: string; pilot_access_status: string;
  access_expires_at: string | null; plan_code: string; payment_status: string; payment_notes: string | null;
};
type Membership = { organization_id: string; user_id: string; role: string; email: string | null };
type Audit = { id: number; organization_id: string | null; action: string; created_at: string };

const defaultExpiry = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
};

export default function BusinessAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [rootUrl, setRootUrl] = useState('');
  const [employeeType, setEmployeeType] = useState('aarya_admissions');
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (window.location.search.includes('template=aarohan')) {
      setEmail('aluminus99@gmail.com');
      setOrganizationName('Aarohan University Demo');
      setRootUrl('https://aarohan-university-demo.vercel.app');
      setEmployeeType('aarya_admissions');
    }
  }, []);

  const authorizedFetch = useCallback(async (path: string, init?: RequestInit) => {
    const { data } = await supabaseAnon.auth.getSession();
    if (!data.session?.access_token) throw new Error('Sign in with a platform admin account.');
    const response = await fetch(path, {
      ...init,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session.access_token}`, ...(init?.headers || {}) },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Admin request failed.');
    return result;
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    setBusy(true); setError('');
    try {
      const result = await authorizedFetch('/api/business/admin');
      setOrganizations(result.organizations); setMemberships(result.memberships); setAudit(result.audit);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Admin portal failed to load.'); }
    finally { setBusy(false); }
  }, [authorizedFetch, user]);

  useEffect(() => { void load(); }, [load]);

  const provision = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const result = await authorizedFetch('/api/business/admin', {
        method: 'POST', body: JSON.stringify({ email, organizationName, rootUrl, employeeType, expiresAt: new Date(`${expiresAt}T23:59:59Z`).toISOString() }),
      });
      setNotice(result.invitationSent ? `Invitation sent to ${result.email}. No password was created or shared.` : `Existing account linked to the pilot workspace.`);
      setEmail(''); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Provisioning failed.'); }
    finally { setBusy(false); }
  };

  const updateAccess = async (organizationId: string, action: 'grant' | 'revoke' | 'extend') => {
    setBusy(true); setError('');
    try {
      const payload: Record<string, string> = { organizationId, action };
      if (action === 'extend') payload.expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
      await authorizedFetch('/api/business/admin', { method: 'PATCH', body: JSON.stringify(payload) });
      setNotice(action === 'extend' ? 'Access extended by 30 days.' : `Access ${action === 'grant' ? 'granted' : 'revoked'}.`);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Access update failed.'); }
    finally { setBusy(false); }
  };

  const updatePayment = async (organization: Organization, paymentStatus: string, planCode: string) => {
    setBusy(true); setError('');
    try {
      await authorizedFetch('/api/business/admin', { method: 'PATCH', body: JSON.stringify({
        organizationId: organization.id, action: 'payment', paymentStatus, planCode, paymentNotes: 'Manually recorded by platform admin',
      }) });
      setNotice('Manual payment record updated. No charge was processed.'); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Payment record update failed.'); }
    finally { setBusy(false); }
  };

  if (authLoading) return <main className="min-h-screen bg-slate-950 p-10 text-slate-400">Checking administrator access…</main>;
  if (!user) return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white"><div className="text-center"><ShieldAlert className="mx-auto h-10 w-10 text-amber-400" /><h1 className="mt-4 text-2xl font-bold">Platform admin sign-in required</h1><Link href="/employees/login" className="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-3 font-semibold">Business login</Link></div></main>;

  return <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Platform administration</p><h1 className="mt-2 text-3xl font-bold">Business pilots and access</h1><p className="mt-2 text-sm text-slate-400">Server-authorized. Payments are records only; this portal never charges a customer.</p></div><button onClick={()=>void load()} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2"><RefreshCw className={`h-4 w-4 ${busy?'animate-spin':''}`} /> Refresh</button></div>
      {error && <p role="alert" className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</p>}
      {notice && <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{notice}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center gap-3"><UserPlus className="h-6 w-6 text-emerald-400" /><h2 className="text-xl font-bold">Invite pilot workspace</h2></div><p className="mt-3 text-sm leading-6 text-slate-400">Supabase sends the invite. The recipient creates their own password; admins never see or share it.</p>
          <form onSubmit={provision} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">Business email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
            <label className="block text-sm font-semibold">Organization<input required value={organizationName} onChange={e=>setOrganizationName(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
            <label className="block text-sm font-semibold">HTTPS website<input required type="url" value={rootUrl} onChange={e=>setRootUrl(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
            <label className="block text-sm font-semibold">Employee<select value={employeeType} onChange={e=>setEmployeeType(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"><option value="aarya_admissions">Aarya · Admissions</option><option value="kabir_lead_followup">Kabir · Lead follow-up</option></select></label>
            <label className="block text-sm font-semibold">Access expiry<input required type="date" value={expiresAt} onChange={e=>setExpiresAt(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-semibold disabled:opacity-60">{busy&&<Loader2 className="h-4 w-4 animate-spin" />}Send secure invitation</button>
          </form>
          <Link href="/employees/admin/aarohan" className="mt-5 block text-center text-sm font-semibold text-indigo-300">Open Aarohan test provisioning →</Link>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center gap-3"><Building2 className="h-6 w-6 text-indigo-400" /><h2 className="text-xl font-bold">Organizations</h2></div>
          <div className="mt-5 space-y-4">{organizations.length ? organizations.map(org=><article key={org.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{org.name}</h3><p className="mt-1 text-xs text-slate-500">{memberships.filter(m=>m.organization_id===org.id).map(m=>m.email||m.user_id).join(', ')||'No members'}</p></div><span className="rounded-full border border-slate-700 px-3 py-1 text-xs">{org.pilot_access_status}</span></div>
            <div className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-3"><p><Clock3 className="mr-1 inline h-3.5 w-3.5" />{org.access_expires_at?new Date(org.access_expires_at).toLocaleDateString():'No expiry'}</p><p>{org.employee_type}</p><p><CreditCard className="mr-1 inline h-3.5 w-3.5" />{org.plan_code} · {org.payment_status}</p></div>
            <div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>void updateAccess(org.id,'grant')} className="rounded-lg bg-emerald-600/20 px-3 py-2 text-xs font-semibold text-emerald-300">Grant</button><button onClick={()=>void updateAccess(org.id,'revoke')} className="rounded-lg bg-rose-600/20 px-3 py-2 text-xs font-semibold text-rose-300">Revoke</button><button onClick={()=>void updateAccess(org.id,'extend')} className="rounded-lg bg-indigo-600/20 px-3 py-2 text-xs font-semibold text-indigo-300">+30 days</button><button onClick={()=>void updatePayment(org,'manual_confirmed',org.plan_code)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">Mark paid</button><button onClick={()=>void updatePayment(org,'unpaid',org.plan_code)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">Mark unpaid</button></div>
          </article>):<p className="text-sm text-slate-500">No pilot organizations yet.</p>}</div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="font-bold">Recent admin activity</h2><div className="mt-4 grid gap-2 md:grid-cols-2">{audit.map(item=><div key={item.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm"><span className="font-semibold">{item.action}</span><time className="ml-2 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</time></div>)}</div></section>
    </div>
  </main>;
}
