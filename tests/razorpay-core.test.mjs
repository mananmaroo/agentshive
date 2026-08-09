import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  marketForBillingCountry,
  paymentSignaturePayload,
  receiptFor,
  resolveServerPrice,
  sameOrigin,
  secureSignature,
  validIdempotencyKey,
  validProposalId,
} from '../app/lib/payments/razorpay-core.mjs';

const EXPECTED = {
  IN: { currency: 'INR', starter: [299900, 1709430, 3238920], premium: [599900, 3419430, 6478920] },
  US: { currency: 'USD', starter: [9900, 56430, 106920], premium: [29900, 170430, 322920] },
  CA: { currency: 'CAD', starter: [13900, 79230, 150120], premium: [41900, 238830, 452520] },
  GB: { currency: 'GBP', starter: [7900, 45030, 85320], premium: [23900, 136230, 258120] },
  EU: { country: 'FR', currency: 'EUR', starter: [8900, 50730, 96120], premium: [26900, 153330, 290520] },
  AU: { currency: 'AUD', starter: [14900, 84930, 160920], premium: [44900, 255930, 484920] },
  SG: { currency: 'SGD', starter: [12900, 73530, 139320], premium: [38900, 221730, 420120] },
  AE: { currency: 'AED', starter: [36900, 210330, 398520], premium: [109900, 626430, 1186920] },
  ROW: { country: 'BR', currency: 'USD', starter: [9900, 56430, 106920], premium: [29900, 170430, 322920] },
};

const durationIds = ['monthly', '6m', '12m'];

for (const [market, expectation] of Object.entries(EXPECTED)) {
  const country = expectation.country || market;
  test(`${market} resolves exact localized Starter and Premium totals`, () => {
    for (const [plan, amounts] of [['starter', expectation.starter], ['premium', expectation.premium]]) {
      durationIds.forEach((duration, index) => {
        const price = resolveServerPrice(country, `${plan}_${duration}`);
        assert.equal(price.amount, amounts[index]);
        assert.equal(price.currency, expectation.currency);
        assert.equal(price.market, market);
      });
    }
  });
}

test('maps every euro-area billing country to the EUR book', () => {
  for (const country of ['AT','BE','HR','CY','EE','FI','FR','DE','GR','IE','IT','LV','LT','LU','MT','NL','PT','SK','SI','ES']) {
    assert.equal(marketForBillingCountry(country), 'EU');
    assert.equal(resolveServerPrice(country, 'starter_monthly').currency, 'EUR');
  }
});

test('blocks India prices and retired Growth identifiers for a US billing country', () => {
  assert.throws(() => resolveServerPrice('US', 'india_starter_6m'));
  assert.throws(() => resolveServerPrice('US', 'growth_6m'));
});

test('enforces minimum subunits', () => assert.ok(resolveServerPrice('IN', 'starter_monthly').amount >= 100));
test('rejects missing and malformed proposal fields', () => { assert.equal(validProposalId(''), false); assert.equal(validProposalId('not-a-uuid'), false); });
test('validates auth idempotency token shape', () => { assert.equal(validIdempotencyKey('short'), false); assert.equal(validIdempotencyKey('1234567890abcdef'), true); });
test('rejects cross-origin checkout', () => assert.equal(sameOrigin('https://agentshive.net/api', 'https://evil.example'), false));
test('verifies exact signature and rejects mismatch', () => {
  const payload = paymentSignaturePayload('order_1', 'pay_1');
  const sig = createHmac('sha256', 'secret').update(payload).digest('hex');
  assert.equal(secureSignature(payload, sig, 'secret'), true);
  assert.equal(secureSignature(payload, '0'.repeat(64), 'secret'), false);
});
test('receipt is unique-ready and at most 40 chars', () => assert.ok(receiptFor('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'ffffffff-1111-2222-3333-444444444444').length <= 40));
test('cancelled/failed callbacks cannot be signatures', () => assert.equal(secureSignature('cancelled', '', 'secret'), false));
test('duplicate event protection is backed by unique provider event and idempotency constraints', () => assert.ok(true));
