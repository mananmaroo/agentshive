import test from 'node:test';
import assert from 'node:assert/strict';
import {
  approvalUrl,
  buildPayPalOrder,
  classifyPayPalEvent,
  entitlementMonths,
  minorToPayPalValue,
  paypalInvoiceId,
} from '../app/lib/payments/paypal-core.mjs';

test('converts integer minor units to exact PayPal decimal strings', () => {
  assert.equal(minorToPayPalValue(9900), '99.00');
  assert.equal(minorToPayPalValue(13900), '139.00');
  assert.throws(() => minorToPayPalValue(99), /minor units/);
  assert.throws(() => minorToPayPalValue(100.5), /minor units/);
});

test('maps fixed prepaid plan IDs to entitlement months', () => {
  assert.equal(entitlementMonths('starter_monthly'), 1);
  assert.equal(entitlementMonths('premium_6m'), 6);
  assert.equal(entitlementMonths('starter_12m'), 12);
  assert.throws(() => entitlementMonths('custom'));
});

test('builds a proposal-bound CAPTURE order without client pricing input', () => {
  const payload = buildPayPalOrder(
    { amount: 9900, currency: 'USD', label: 'Starter · Monthly' },
    { id: 'proposal-1' },
    { id: 'organization-1' },
    'ah_invoice_1',
    'https://preview.example/employees/checkout?paypal=approved',
    'https://preview.example/employees/checkout?paypal=cancelled',
  );
  assert.equal(payload.intent, 'CAPTURE');
  assert.equal(payload.purchase_units[0].reference_id, 'proposal-1');
  assert.equal(payload.purchase_units[0].custom_id, 'organization-1');
  assert.deepEqual(payload.purchase_units[0].amount, { currency_code: 'USD', value: '99.00' });
  assert.equal(payload.payment_source.paypal.experience_context.shipping_preference, 'NO_SHIPPING');
});

test('accepts only PayPal Sandbox approval URLs', () => {
  assert.equal(
    approvalUrl({ links: [{ rel: 'payer-action', href: 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER' }] }),
    'https://www.sandbox.paypal.com/checkoutnow?token=ORDER',
  );
  assert.throws(() => approvalUrl({ links: [{ rel: 'approve', href: 'https://www.paypal.com/live' }] }), /Sandbox/);
});

test('classifies capture and dispute lifecycle without granting on pending events', () => {
  assert.equal(classifyPayPalEvent('PAYMENT.CAPTURE.COMPLETED', { status: 'COMPLETED' }), 'activate');
  assert.equal(classifyPayPalEvent('PAYMENT.CAPTURE.DENIED', {}), 'fail');
  assert.equal(classifyPayPalEvent('CUSTOMER.DISPUTE.CREATED', {}), 'dispute');
  assert.equal(classifyPayPalEvent('PAYMENT.CAPTURE.PENDING', {}), 'ignore');
});

test('creates short non-secret invoice identifiers', () => {
  const invoice = paypalInvoiceId(
    'c3087b31-96c2-4a7d-94a2-67b663a26fa0',
    '11111111-2222-3333-4444-555555555555',
  );
  assert.ok(invoice.length <= 40);
  assert.match(invoice, /^ah_[a-z0-9_]+$/i);
});
