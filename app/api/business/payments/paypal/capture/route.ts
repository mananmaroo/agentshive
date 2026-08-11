import type { NextRequest } from 'next/server';
import { minorToPayPalValue, validPayPalProviderId } from '@/app/lib/payments/paypal-core.mjs';
import { paypalSandboxRequest, requirePayPalSandboxEnvironment } from '@/app/lib/payments/paypal-server';
import { PAYMENT_PROVIDER, requirePaymentProvider, resolvePaymentContract } from '@/app/lib/payments/payment-routing.mjs';
import { validIdempotencyKey } from '@/app/lib/payments/razorpay-core.mjs';
import { requirePaymentUser, requireProposal, routeError } from '@/app/lib/payments/payment-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    requirePayPalSandboxEnvironment();
    const { user, admin } = await requirePaymentUser(request);
    const body = await request.json().catch(() => null) as { orderId?: unknown } | null;
    const suppliedIdempotencyKey = request.headers.get('idempotency-key');

    if (!body || !validPayPalProviderId(body.orderId) || !validIdempotencyKey(suppliedIdempotencyKey)) {
      return Response.json(
        { error: 'A valid PayPal Sandbox order and idempotency key are required.' },
        { status: 400 },
      );
    }

    const orderId = String(body.orderId);
    const idempotencyKey = String(suppliedIdempotencyKey);
    const { data: local } = await admin.from('business_payment_orders')
      .select('id,organization_id,proposal_id,provider_order_id,amount,currency,status')
      .eq('provider', PAYMENT_PROVIDER.PAYPAL)
      .eq('provider_order_id', orderId)
      .eq('created_by', user.id)
      .single();
    if (!local) throw Object.assign(new Error('PayPal Sandbox order was not found.'), { status: 404 });

    const { proposal, organization } = await requireProposal(admin, user, local.proposal_id);
    const contract = requirePaymentProvider(
      resolvePaymentContract(organization.billing_country, proposal.billing_country, proposal.price_book_id),
      PAYMENT_PROVIDER.PAYPAL,
    );

    const providerOrder = await paypalSandboxRequest(
      `/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    ) as any;
    const unit = providerOrder.purchase_units?.[0];
    const exact = providerOrder.id === orderId
      && providerOrder.status === 'APPROVED'
      && unit?.reference_id === proposal.id
      && unit?.custom_id === organization.id
      && unit?.amount?.currency_code === contract.currency
      && unit?.amount?.value === minorToPayPalValue(contract.amount)
      && Number(local.amount) === contract.amount
      && local.currency === contract.currency;
    if (!exact) {
      throw Object.assign(new Error('PayPal order no longer matches the approved proposal.'), {
        status: 409,
        code: 'PAYMENT_CONTRACT_MISMATCH',
      });
    }

    const capture = await paypalSandboxRequest(
      `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      { method: 'POST', body: '{}' },
      idempotencyKey,
    ) as { status?: string };

    await admin.from('business_payment_orders')
      .update({ status: capture.status === 'COMPLETED' ? 'capture_pending_webhook' : 'capture_requested' })
      .eq('id', local.id)
      .eq('provider', PAYMENT_PROVIDER.PAYPAL);

    return Response.json({
      received: true,
      mode: 'sandbox',
      status: 'awaiting_verified_webhook',
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return routeError(error);
  }
}
