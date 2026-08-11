import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PAYMENT_PROVIDER,
  providerForPayment,
  requirePaymentProvider,
  resolvePaymentContract,
} from '../app/lib/payments/payment-routing.mjs';

const paypalCases = [
  ['US', 'USD'], ['CA', 'CAD'], ['GB', 'GBP'], ['DE', 'EUR'],
  ['AU', 'AUD'], ['SG', 'SGD'], ['BR', 'USD'],
];

const plans = [
  'starter_monthly',
  'starter_6m',
  'starter_12m',
  'premium_monthly',
  'premium_6m',
  'premium_12m',
];

test('routes verified India proposals to Razorpay in INR', () => {
  const contract = resolvePaymentContract('IN', 'IN', 'starter_monthly');
  assert.equal(contract.provider, PAYMENT_PROVIDER.RAZORPAY);
  assert.equal(contract.currency, 'INR');
  assert.equal(contract.amount, 299900);
});

test('routes PayPal-supported international price books to PayPal', () => {
  for (const [country, currency] of paypalCases) {
    for (const plan of plans) {
      const contract = resolvePaymentContract(country, country, plan);
      assert.equal(contract.provider, PAYMENT_PROVIDER.PAYPAL);
      assert.equal(contract.currency, currency);
      assert.ok(Number.isSafeInteger(contract.amount));
      assert.ok(contract.amount >= 100);
    }
  }
});

test('holds UAE AED checkout until an active provider supports AED', () => {
  assert.throws(
    () => resolvePaymentContract('AE', 'AE', 'starter_monthly'),
    (error) => error?.code === 'PAYMENT_CURRENCY_UNSUPPORTED' && /AED/.test(error.message),
  );
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
  assert.throws(() => requirePaymentProvider(us, PAYMENT_PROVIDER.RAZORPAY), /must be paid through paypal/);
  assert.throws(() => requirePaymentProvider(india, PAYMENT_PROVIDER.PAYPAL), /must be paid through razorpay/);
});

test('normalizes country and currency only in the server contract', () => {
  assert.equal(providerForPayment(' in ', ' inr '), PAYMENT_PROVIDER.RAZORPAY);
  assert.equal(providerForPayment('ca', 'cad'), PAYMENT_PROVIDER.PAYPAL);
});

test('keeps Stripe reserved but inactive for every current price book', () => {
  const countries = ['IN', ...paypalCases.map(([country]) => country)];
  for (const country of countries) {
    for (const plan of plans) {
      assert.notEqual(resolvePaymentContract(country, country, plan).provider, PAYMENT_PROVIDER.STRIPE);
    }
  }
});
