import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { classifyPayPalEvent, minorToPayPalValue, validPayPalProviderId } from '@/app/lib/payments/paypal-core.mjs';
import {
  paypalSandboxRequest,
  requirePayPalSandboxEnvironment,
  verifyPayPalWebhook,
} from '@/app/lib/payments/paypal-server';
import { PAYMENT_PROVIDER } from '@/app/lib/payments/payment-routing.mjs';
import { requirePaymentBackendEnvironment, routeError } from '@/app/lib/payments/payment-server';

export const runtime = 'nodejs';

function captureIdFromResource(resource: any) {
  if (resource?.resource_type === 'capture' || resource?.supplementary_data?.related_ids?.order_id) {
    return String(resource?.id || '');
  }
  const up = resource?.links?.find((link: any) => link?.rel === 'up')?.href;
  const match = typeof up === 'string' ? up.match(/\/captures\/([A-Z0-9-]+)/i) : null;
  return match?.[1] || String(resource?.disputed_transactions?.[0]?.seller_transaction_id || '');
}

export async function POST(request: Request) {
  try {
    requirePayPalSandboxEnvironment();
    const raw = await request.text();
    const event = JSON.parse(raw) as {
      id?: string;
      event_type?: string;
      resource?: any;
    };
    if (!event.id || !/^[A-Z0-9-]{6,80}$/i.test(event.id) || !event.event_type) {
      return Response.json({ error: 'Invalid webhook.' }, { status: 400 });
    }
    if (!await verifyPayPalWebhook(request, event)) {
      return Response.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    let orderId = String(event.resource?.supplementary_data?.related_ids?.order_id || '');
    let providerPaymentId = captureIdFromResource(event.resource);
    if (!orderId && validPayPalProviderId(providerPaymentId)) {
      const capture = await paypalSandboxRequest(
        `/v2/payments/captures/${encodeURIComponent(providerPaymentId)}`,
      ) as any;
      orderId = String(capture?.supplementary_data?.related_ids?.order_id || '');
    }
    if (!validPayPalProviderId(orderId)) {
      return Response.json({ received: true, ignored: true });
    }

    const backend = requirePaymentBackendEnvironment();
    const admin = createClient(backend.url, backend.service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: local } = await admin.from('business_payment_orders')
      .select('*')
      .eq('provider', PAYMENT_PROVIDER.PAYPAL)
      .eq('provider_order_id', orderId)
      .maybeSingle();
    if (!local) return Response.json({ received: true, ignored: true });

    const providerOrder = await paypalSandboxRequest(
      `/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    ) as any;
    const unit = providerOrder.purchase_units?.[0];
    const exact = providerOrder.id === orderId
      && unit?.reference_id === String(local.proposal_id)
      && unit?.custom_id === String(local.organization_id)
      && unit?.amount?.currency_code === local.currency
      && unit?.amount?.value === minorToPayPalValue(Number(local.amount));
    if (!exact) {
      throw Object.assign(new Error('PayPal webhook does not match the recorded order.'), {
        status: 409,
        code: 'PAYMENT_CONTRACT_MISMATCH',
      });
    }

    let action = classifyPayPalEvent(event.event_type, event.resource);
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' && event.resource?.status !== 'COMPLETED') {
      action = 'ignore';
    }
    if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
      const refundedMinor = Math.round(Number(event.resource?.amount?.value || 0) * 100);
      action = refundedMinor > 0 && refundedMinor < Number(local.amount)
        ? 'partial_refund'
        : 'full_refund';
    }

    const { data: applied, error: finalizeError } = await admin.rpc(
      'business_finalize_payment_event',
      {
        p_provider: PAYMENT_PROVIDER.PAYPAL,
        p_event_id: event.id,
        p_event_type: event.event_type,
        p_payment_id: providerPaymentId,
        p_order_id: orderId,
        p_payload_hash: createHash('sha256').update(raw).digest('hex'),
        p_action: action,
      },
    );
    if (finalizeError) throw new Error('Webhook could not be finalized.');

    return Response.json({ received: true, duplicate: !applied });
  } catch (error) {
    return routeError(error);
  }
}
