'use client';

import { useEffect, useState } from 'react';
import { supabaseAnon } from '@/app/lib/supabase-anon';

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open(): void; on(event: string, cb: (response: unknown) => void): void } } }

function loadCheckout() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Secure checkout could not load.'));
    document.head.appendChild(script);
  });
}

type ProposalSummary = {
  organizationName: string;
  customerEmail: string;
  priceBookId: string;
  description: string;
  amount: number;
  currency: string;
  billingCountry: string;
  expiresAt: string;
  testMode: boolean;
};

export default function RazorpayCheckout({ proposalId }: { proposalId: string }) {
  const [summary, setSummary] = useState<ProposalSummary | null>(null);
  const [summaryError, setSummaryError] = useState('');
  const [state, setState] = useState<'idle'|'loading'|'cancelled'|'failed'|'success'>('idle');
  const [message, setMessage] = useState('No charge has been started.');
  const safeProposalId = /^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(proposalId) ? proposalId : '';
  const returnPath = safeProposalId ? `/employees/checkout?proposal=${encodeURIComponent(safeProposalId)}` : '';
  const signInHref = returnPath ? `/employees/login?returnTo=${encodeURIComponent(returnPath)}` : '/employees/login';

  useEffect(() => {
    let active = true;
    async function loadSummary() {
      try {
        const { data } = await supabaseAnon.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error('Please sign in to your Business account first.');
        const response = await fetch(`/api/business/payments/proposals/${proposalId}`, {
          method: 'POST',
          headers: { authorization: `Bearer ${token}`, 'x-agentshive-csrf': '1' },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Proposal details could not be loaded.');
        if (active) setSummary(result);
      } catch (error) {
        if (active) setSummaryError(error instanceof Error ? error.message : 'Proposal details could not be loaded.');
      }
    }
    void loadSummary();
    return () => { active = false; };
  }, [proposalId]);

  async function begin() {
    if (!summary || summary.amount !== 299900 || summary.currency !== 'INR' || summary.priceBookId !== 'starter_monthly' || summary.customerEmail.toLowerCase() !== 'agentshive26@gmail.com') {
      setState('failed');
      setMessage('Checkout details do not match the authorized TEST transaction.');
      return;
    }
    setState('loading'); setMessage('Preparing secure checkout…');
    try {
      const { data } = await supabaseAnon.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Please sign in to your Business account first.');
      await loadCheckout();
      const idempotencyKey = crypto.randomUUID();
      const orderResponse = await fetch('/api/business/payments/razorpay/orders', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, 'x-agentshive-csrf': '1', 'idempotency-key': idempotencyKey }, body: JSON.stringify({ proposalId }) });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || 'Checkout could not start.');
      if (!window.Razorpay) throw new Error('Secure checkout is unavailable.');
      const checkout = new window.Razorpay({
        key: order.keyId, order_id: order.orderId, amount: order.amount, currency: order.currency,
        name: order.name, description: order.description, modal: { ondismiss: () => { setState('cancelled'); setMessage('Checkout was cancelled. No access was activated.'); } },
        handler: async (result: Record<string, string>) => {
          setMessage('Verifying payment securely…');
          const verify = await fetch('/api/business/payments/razorpay/verify', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, 'x-agentshive-csrf': '1' }, body: JSON.stringify(result) });
          const verified = await verify.json();
          if (!verify.ok) { setState('failed'); setMessage(verified.error || 'Payment verification failed.'); return; }
          setState('success'); setMessage('Payment verified. Access will activate only after Razorpay confirms the captured payment by webhook.');
        },
      });
      checkout.on('payment.failed', () => { setState('failed'); setMessage('Payment failed. No access was activated.'); });
      checkout.open();
    } catch (error) { setState('failed'); setMessage(error instanceof Error ? error.message : 'Checkout could not start.'); }
  }

  return <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
    <div className="mb-5 inline-flex rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Razorpay TEST MODE · No live charge</div>\n    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Approved proposal</p>
    <h1 className="mt-3 text-3xl font-bold">Complete secure payment</h1>
    <p className="mt-3 text-slate-400">The amount and currency come from your approved proposal and verified billing country. They cannot be changed here.</p>
    {summary ? <dl className="mt-6 grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm sm:grid-cols-2">
      <div><dt className="text-slate-500">Business</dt><dd className="mt-1 font-semibold">{summary.organizationName}</dd></div>
      <div><dt className="text-slate-500">Customer</dt><dd className="mt-1 font-semibold">{summary.customerEmail}</dd></div>
      <div><dt className="text-slate-500">Plan</dt><dd className="mt-1 font-semibold">{summary.description}</dd></div>
      <div><dt className="text-slate-500">TEST amount</dt><dd className="mt-1 text-xl font-bold text-emerald-300">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: summary.currency, maximumFractionDigits: 0 }).format(summary.amount / 100)}</dd></div>
    </dl> : <div className="mt-5">
      <p role="status" className="text-sm text-slate-400">{summaryError || 'Verifying proposal identity and amount…'}</p>
      {summaryError === 'Please sign in to your Business account first.' && <a href={signInHref} className="mt-4 inline-flex rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20">Sign in to continue</a>}
    </div>}
    <button onClick={begin} disabled={!summary || state === 'loading' || state === 'success'} className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-semibold disabled:opacity-60">{state === 'loading' ? 'Preparing…' : 'Continue to Razorpay'}</button>
    <p role="status" className={`mt-4 text-sm ${state === 'failed' ? 'text-rose-300' : state === 'success' ? 'text-emerald-300' : 'text-slate-400'}`}>{message}</p>
    <p className="mt-5 text-xs text-slate-500">TEST MODE uses Razorpay test credentials and test cards only. Do not enter a real card. Live payments remain disabled until separately approved.</p>
  </section>;
}
