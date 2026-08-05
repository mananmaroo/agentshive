/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import type { NextRequest } from 'next/server';
import { paymentSignaturePayload, secureSignature } from '@/app/lib/payments/razorpay-core.mjs';
import { razorpayClient, requirePaymentUser, routeError } from '@/app/lib/payments/razorpay-server';

export const runtime = 'nodejs';
const FIELD = /^[-_A-Za-z0-9]{6,100}$/;

export async function POST(request: NextRequest) {
  try {
    const { user, admin, env } = await requirePaymentUser(request);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const orderId = String(body?.razorpay_order_id || '');
    const paymentId = String(body?.razorpay_payment_id || '');
    const signature = String(body?.razorpay_signature || '');
    if (!FIELD.test(orderId) || !FIELD.test(paymentId) || !/^[a-f0-9]{64}$/i.test(signature)) return Response.json({ error: 'Invalid payment response.' }, { status: 400 });
    if (!secureSignature(paymentSignaturePayload(orderId, paymentId), signature, env.keySecret)) return Response.json({ error: 'Payment signature mismatch.' }, { status: 400 });

    const { data: local } = await admin.from('business_payment_orders').select('*').eq('provider_order_id', orderId).eq('created_by', user.id).single();
    if (!local) return Response.json({ error: 'Payment order was not found.' }, { status: 404 });
    const [payment, order] = await Promise.all([razorpayClient().payments.fetch(paymentId), razorpayClient().orders.fetch(orderId)]);
    const valid = payment.order_id === orderId && Number(payment.amount) === Number(local.amount) && payment.currency === local.currency
      && Number(order.amount) === Number(local.amount) && order.currency === local.currency
      && ['authorized', 'captured'].includes(String(payment.status));
    if (!valid) return Response.json({ error: 'Payment details did not match the approved order.' }, { status: 409 });
    const { error: updateError } = await admin.from('business_payment_orders').update({ provider_payment_id: paymentId, status: payment.status === 'captured' ? 'captured_pending_webhook' : 'authorized_pending_capture', verified_at: new Date().toISOString() }).eq('id', local.id);
    if (updateError) throw new Error('Verified payment could not be recorded.');
    return Response.json({ verified: true, activation: 'pending_webhook' }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) { return routeError(error); }
}
