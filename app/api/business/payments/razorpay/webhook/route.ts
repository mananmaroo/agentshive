/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { secureSignature } from '@/app/lib/payments/razorpay-core.mjs';
import { razorpayClient, requirePaymentEnvironment, routeError } from '@/app/lib/payments/razorpay-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const eventId = request.headers.get('x-razorpay-event-id');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    if (!eventId || !/^[A-Za-z0-9_-]{6,120}$/.test(eventId) || !secureSignature(raw, signature, webhookSecret)) return Response.json({ error: 'Invalid webhook.' }, { status: 400 });
    const env = requirePaymentEnvironment();
    const admin = createClient(env.url, env.service, { auth: { persistSession: false } });
    const event = JSON.parse(raw) as { event?: string; payload?: Record<string,{entity?:Record<string,unknown>}> };
    const entity = event.payload?.payment?.entity || event.payload?.refund?.entity || event.payload?.dispute?.entity || {};
    const directPaymentId = String(entity.id || '');
    const paymentId = event.payload?.payment ? directPaymentId : String(entity.payment_id || '');
    if (!paymentId) return Response.json({ received: true, ignored: true });
    const payment = await razorpayClient().payments.fetch(paymentId);
    const orderId = String(payment.order_id || '');
    if (!orderId) return Response.json({ received: true, ignored: true });
    const order = await razorpayClient().orders.fetch(orderId);
    const { data: local } = await admin.from('business_payment_orders').select('*').eq('provider_order_id', orderId).maybeSingle();
    if (!local) return Response.json({ received: true, ignored: true });
    const exact = payment.order_id === orderId && Number(payment.amount) === Number(local.amount) && payment.currency === local.currency
      && Number(order.amount) === Number(local.amount) && order.currency === local.currency;
    const notesMatch = String(order.notes?.proposal_id || '') === String(local.proposal_id) && String(order.notes?.organization_id || '') === String(local.organization_id);
    let action = 'ignore';
    if (event.event === 'payment.captured' && payment.status === 'captured' && exact && notesMatch) action = 'activate';
    if (event.event === 'payment.failed') action = 'fail';
    if (event.event === 'refund.processed') action = 'refund';
    if (event.event === 'payment.dispute.created') action = 'dispute';
    const { data: applied, error: finalizeError } = await admin.rpc('business_finalize_razorpay_event', {
      p_event_id: eventId, p_event_type: event.event || 'unknown', p_payment_id: paymentId,
      p_order_id: orderId, p_payload_hash: createHash('sha256').update(raw).digest('hex'), p_action: action,
    });
    if (finalizeError) throw new Error('Webhook could not be finalized.');
    return Response.json({ received: true, duplicate: !applied });
  } catch (error) { return routeError(error); }
}
