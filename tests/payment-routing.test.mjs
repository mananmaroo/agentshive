import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PAYMENT_PROVIDER,
  providerForBillingCountry,
  requirePaymentProvider,
  resolvePaymentContract,
} from '../app/lib/payments/payment-routing.mjs';

const internationalCases = [
  ['US', 'USD'], ['CA', 'CAD'], ['GB', 'GBP'], ['DE', 'EUR'],
  ['AU', 'AUD'], ['SG', 'SGD'], ['AE', 'AED'], ['BR', 'USD'],
];

test('routes verified India proposals to Razorpay in INR', () => {
  const contract = resolvePaymentContract('IN', 'IN', 'starter_monthly');
  assert.equal(contract.provider, PAYMENT_PROVIDER.RAZORPAY);
  assert.equal(contract.currency, 'INR');
  assert.equal(contract.amount, 299900);
});

test('routes every supported international market to Stripe in localized currency', () => {
  for (const [country, currency] of internationalCases) {
    for (const plan of ['starter_monthly', 'starter_6m', 'starter_12m', 'premium_monthly', 'premium_6m', 'premium_12m']) {
      const contract = resolvePaymentContract(country, country, plan);
      assert.equal(contract.provider, PAYMENT_PROVIDER.STRIPE);
      assert.equal(contract.currency, currency);
      assert.ok(Number.isSafeInteger(contract.amount));
      assert.ok(contract.amount >= 100);
    }
  }
});

test('rejects proposal and organization country mismatches', () => {
  assert.throws(
    () => resolvePaymentContract('US', 'IN', 'starter_monthly'),
    /does not match/,
  );
});

test('blocks a provider endpoint from handling the other provider contract', () => {
  const india = resolvePaymentContract('IN', 'IN', 'starter_monthly');
  const us = resolvePaymentContract('US', 'US', 'starter_monthly');
  assert.throws(() => requirePaymentProvider(us, PAYMENT_PROVIDER.RAZORPAY), /must be paid through stripe/);
  assert.throws(() => requirePaymentProvider(india, PAYMENT_PROVIDER.STRIPE), /must be paid through razorpay/);
});

test('normalizes billing country only on the server contract', () => {
  assert.equal(providerForBillingCountry(' in '), PAYMENT_PROVIDER.RAZORPAY);
  assert.equal(providerForBillingCountry('ca'), PAYMENT_PROVIDER.STRIPE);
});
