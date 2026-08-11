export const PAYPAL_SANDBOX_BASE = 'https://api-m.sandbox.paypal.com';

export function minorToPayPalValue(amount) {
  if (!Number.isSafeInteger(amount) || amount < 100) {
    throw new Error('PayPal amount must be an integer in minor units.');
  }
  return (amount / 100).toFixed(2);
}

export function entitlementMonths(priceBookId) {
  const value = String(priceBookId || '');
  if (value.endsWith('_12m')) return 12;
  if (value.endsWith('_6m')) return 6;
  if (value.endsWith('_monthly')) return 1;
  throw new Error('Unsupported entitlement term.');
}

export function paypalInvoiceId(proposalId, nonce) {
  const proposal = String(proposalId || '').replaceAll('-', '').slice(0, 18);
  const suffix = String(nonce || '').replaceAll('-', '').slice(0, 10);
  return `ah_${proposal}_${suffix}`.slice(0, 40);
}

export function buildPayPalOrder(contract, proposal, organization, invoiceId, returnUrl, cancelUrl) {
  return {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: String(proposal.id),
      custom_id: String(organization.id),
      invoice_id: invoiceId,
      description: String(contract.label).slice(0, 127),
      amount: {
        currency_code: contract.currency,
        value: minorToPayPalValue(contract.amount),
      },
    }],
    payment_source: {
      paypal: {
        experience_context: {
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      },
    },
  };
}

export function approvalUrl(order) {
  const link = order?.links?.find((candidate) => candidate?.rel === 'payer-action' || candidate?.rel === 'approve');
  if (!link?.href || !/^https:\/\/(www\.)?sandbox\.paypal\.com\//.test(link.href)) {
    throw new Error('PayPal Sandbox approval link was not returned.');
  }
  return link.href;
}

export function classifyPayPalEvent(eventType, resource) {
  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') return 'activate';
  if (eventType === 'PAYMENT.CAPTURE.DENIED' || eventType === 'PAYMENT.CAPTURE.REVERSED') return 'fail';
  if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
    const refunded = Number(resource?.amount?.value);
    const original = Number(resource?.seller_payable_breakdown?.gross_amount?.value || resource?.amount?.value);
    return Number.isFinite(refunded) && Number.isFinite(original) && refunded < original
      ? 'partial_refund'
      : 'full_refund';
  }
  if (eventType?.startsWith('CUSTOMER.DISPUTE.')) return 'dispute';
  return 'ignore';
}

export function validPayPalProviderId(value) {
  return typeof value === 'string' && /^[A-Z0-9-]{6,40}$/i.test(value);
}
