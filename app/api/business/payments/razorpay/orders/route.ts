import { randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { receiptFor, resolveServerPrice, validIdempotencyKey, validProposalId } from '@/app/lib/payments/razorpay-core.mjs';
import { razorpayClient, requirePaymentUser, requireProposal, routeError } from '@/app/lib/payments/razorpay-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { user, admin, env } = await requirePaymentUser(request);
    const body = await request.json().catch(() => null) as { proposalId?: unknown } | null;
    const idempotencyKey = request.headers.get('idempotency-key');
    if (!body || !validProposalId(body.proposalId) || !validIdempotencyKey(idempotencyKey)) {
      return Response.json({ error: 'A valid proposal and idempotency key are required.' }, { status: 400 });
    }
    const { proposal, organization } = await requireProposal(admin, user, body.proposalId);
    const price = resolveServerPrice(organization.billing_country, proposal.price_book_id);

    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await admin.from('business_payment_orders').select('id', { count: 'exact', head: true })
      .eq('created_by', user.id).gte('created_at', since);
    if ((count || 0) >= 5) return Response.json({ error: 'Please wait before trying again.' }, { status: 429 });

    const { data: prior } = await admin.from('business_payment_orders')
      .select('provider_order_id,amount,currency,status').eq('created_by', user.id).eq('idempotency_key', idempotencyKey).maybeSingle();
    if (prior) return Response.json({ keyId: env.keyId, orderId: prior.provider_order_id, amount: prior.amount, currency: prior.currency, name: 'AgentsHive', description: price.label });

    const receipt = receiptFor(proposal.id, randomUUID());
    const providerOrder = await razorpayClient().orders.create({
      amount: price.amount, currency: price.currency, receipt,
      notes: { proposal_id: proposal.id, organization_id: organization.id, price_book_id: price.priceBookId },
    });
    const { error: insertError } = await admin.from('business_payment_orders').insert({
      organization_id: organization.id, proposal_id: proposal.id, created_by: user.id,
      provider_order_id: providerOrder.id, receipt, amount: price.amount, currency: price.currency,
      idempotency_key: idempotencyKey, status: 'created',
    });
    if (insertError) throw new Error('Order could not be recorded.');
    return Response.json({ keyId: env.keyId, orderId: providerOrder.id, amount: price.amount, currency: price.currency, name: 'AgentsHive', description: price.label }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) { return routeError(error); }
}
