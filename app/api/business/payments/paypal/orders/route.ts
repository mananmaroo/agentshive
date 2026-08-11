import { randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';
import {
  approvalUrl,
  buildPayPalOrder,
  entitlementMonths,
  paypalInvoiceId,
  validPayPalProviderId,
} from '@/app/lib/payments/paypal-core.mjs';
import { paypalSandboxRequest, requirePayPalSandboxEnvironment } from '@/app/lib/payments/paypal-server';
import { PAYMENT_PROVIDER, requirePaymentProvider, resolvePaymentContract } from '@/app/lib/payments/payment-routing.mjs';
import { validIdempotencyKey, validProposalId } from '@/app/lib/payments/razorpay-core.mjs';
import { requirePaymentUser, requireProposal, routeError } from '@/app/lib/payments/payment-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    requirePayPalSandboxEnvironment();
    const { user, admin } = await requirePaymentUser(request);
    const body = await request.json().catch(() => null) as { proposalId?: unknown } | null;
    const suppliedIdempotencyKey = request.headers.get('idempotency-key');

    if (!body || !validProposalId(body.proposalId) || !validIdempotencyKey(suppliedIdempotencyKey)) {
      return Response.json(
        { error: 'A valid proposal and idempotency key are required.' },
        { status: 400 },
      );
    }

    const proposalId = String(body.proposalId);
    const idempotencyKey = String(suppliedIdempotencyKey);
    const { proposal, organization } = await requireProposal(admin, user, proposalId);
    const contract = requirePaymentProvider(
      resolvePaymentContract(
        organization.billing_country,
        proposal.billing_country,
        proposal.price_book_id,
      ),
      PAYMENT_PROVIDER.PAYPAL,
    );

    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await admin.from('business_payment_orders')
      .select('id', { count: 'exact', head: true })
      .eq('provider', PAYMENT_PROVIDER.PAYPAL)
      .eq('created_by', user.id)
      .gte('created_at', since);
    if ((count || 0) >= 5) {
      return Response.json({ error: 'Please wait before trying again.' }, { status: 429 });
    }

    const { data: prior } = await admin.from('business_payment_orders')
      .select('provider_order_id,amount,currency,status')
      .eq('provider', PAYMENT_PROVIDER.PAYPAL)
      .eq('created_by', user.id)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (prior) {
      const existing = await paypalSandboxRequest(`/v2/checkout/orders/${encodeURIComponent(prior.provider_order_id)}`);
      return Response.json({
        provider: PAYMENT_PROVIDER.PAYPAL,
        mode: 'sandbox',
        orderId: prior.provider_order_id,
        approvalUrl: approvalUrl(existing),
        amount: prior.amount,
        currency: prior.currency,
        description: contract.label,
      }, { headers: { 'cache-control': 'no-store' } });
    }

    const invoiceId = paypalInvoiceId(proposal.id, randomUUID());
    const origin = request.nextUrl.origin;
    const returnUrl = new URL('/employees/checkout', origin);
    returnUrl.searchParams.set('proposal', proposal.id);
    returnUrl.searchParams.set('paypal', 'approved');
    const cancelUrl = new URL('/employees/checkout', origin);
    cancelUrl.searchParams.set('proposal', proposal.id);
    cancelUrl.searchParams.set('paypal', 'cancelled');

    const providerOrder = await paypalSandboxRequest('/v2/checkout/orders', {
      method: 'POST',
      body: JSON.stringify(buildPayPalOrder(
        contract,
        proposal,
        organization,
        invoiceId,
        returnUrl.toString(),
        cancelUrl.toString(),
      )),
    }, idempotencyKey) as { id?: string; links?: Array<{ rel?: string; href?: string }> };

    if (!validPayPalProviderId(providerOrder.id)) {
      throw new Error('PayPal Sandbox returned an invalid order.');
    }

    const { error: insertError } = await admin.from('business_payment_orders').insert({
      provider: PAYMENT_PROVIDER.PAYPAL,
      organization_id: organization.id,
      proposal_id: proposal.id,
      created_by: user.id,
      provider_order_id: providerOrder.id,
      receipt: invoiceId,
      amount: contract.amount,
      currency: contract.currency,
      setup_fee_amount: 0,
      service_fee_amount: contract.amount,
      entitlement_months: entitlementMonths(contract.priceBookId),
      idempotency_key: idempotencyKey,
      status: 'created',
    });
    if (insertError) throw new Error('Order could not be recorded.');

    return Response.json({
      provider: PAYMENT_PROVIDER.PAYPAL,
      mode: 'sandbox',
      orderId: providerOrder.id,
      approvalUrl: approvalUrl(providerOrder),
      amount: contract.amount,
      currency: contract.currency,
      description: contract.label,
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return routeError(error);
  }
}
