'use client';

import { useState } from 'react';
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

export default function RazorpayCheckout({ proposalId }: { proposalId: string }) {
  const [state, setState] = useState<'idle'|'loading'|'cancelled'|'failed'|'success'>('idle');
  const [message, setMessage] = useState('No charge has been started.');

  async function begin() {
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
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Approved proposal</p>
    <h1 className="mt-3 text-3xl font-bold">Complete secure payment</h1>
    <p className="mt-3 text-slate-400">The amount and currency come from your approved proposal and verified billing country. They cannot be changed here.</p>
    <button onClick={begin} disabled={state === 'loading' || state === 'success'} className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-semibold disabled:opacity-60">{state === 'loading' ? 'Preparing…' : 'Continue to Razorpay'}</button>
    <p role="status" className={`mt-4 text-sm ${state === 'failed' ? 'text-rose-300' : state === 'success' ? 'text-emerald-300' : 'text-slate-400'}`}>{message}</p>
    <p className="mt-5 text-xs text-slate-500">Test integration only. Production checkout remains disabled until keys are rotated, webhooks are verified, and deployment is approved.</p>
  </section>;
}
