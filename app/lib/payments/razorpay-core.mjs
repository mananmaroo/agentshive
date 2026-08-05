/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import { createHmac, timingSafeEqual } from 'node:crypto';

export const PRICE_BOOK = Object.freeze({
  IN: Object.freeze({
    starter_6m: Object.freeze({ amount: 2849400, currency: 'INR', label: 'Starter · 6 months' }),
    starter_12m: Object.freeze({ amount: 5398900, currency: 'INR', label: 'Starter · 12 months' }),
    growth_6m: Object.freeze({ amount: 8549400, currency: 'INR', label: 'Growth · 6 months' }),
    growth_12m: Object.freeze({ amount: 16198900, currency: 'INR', label: 'Growth · 12 months' }),
  }),
  US: Object.freeze({
    starter_6m: Object.freeze({ amount: 84930, currency: 'USD', label: 'Starter · 6 months' }),
    starter_12m: Object.freeze({ amount: 160920, currency: 'USD', label: 'Starter · 12 months' }),
    growth_6m: Object.freeze({ amount: 255930, currency: 'USD', label: 'Growth · 6 months' }),
    growth_12m: Object.freeze({ amount: 484920, currency: 'USD', label: 'Growth · 12 months' }),
  }),
  GB: Object.freeze({
    starter_6m: Object.freeze({ amount: 67830, currency: 'GBP', label: 'Starter · 6 months' }),
    starter_12m: Object.freeze({ amount: 128520, currency: 'GBP', label: 'Starter · 12 months' }),
    growth_6m: Object.freeze({ amount: 198930, currency: 'GBP', label: 'Growth · 6 months' }),
    growth_12m: Object.freeze({ amount: 376920, currency: 'GBP', label: 'Growth · 12 months' }),
  }),
});

export function resolveServerPrice(country, priceBookId) {
  const normalizedCountry = String(country || '').trim().toUpperCase();
  const normalizedId = String(priceBookId || '').trim();
  const price = PRICE_BOOK[normalizedCountry]?.[normalizedId];
  if (!price || !Number.isSafeInteger(price.amount) || price.amount < 100) {
    throw new Error('No approved regional price exists for this proposal.');
  }
  return { ...price, billingCountry: normalizedCountry, priceBookId: normalizedId };
}

export function validProposalId(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(value);
}

export function validIdempotencyKey(value) {
  return typeof value === 'string' && /^[A-Za-z0-9._:-]{16,80}$/.test(value);
}

export function sameOrigin(requestUrl, origin) {
  if (!origin) return false;
  try { return new URL(requestUrl).origin === new URL(origin).origin; } catch { return false; }
}

export function secureSignature(payload, supplied, secret) {
  if (!secret || typeof supplied !== 'string') return false;
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  const left = Buffer.from(expected, 'utf8');
  const right = Buffer.from(supplied, 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}

export function paymentSignaturePayload(orderId, paymentId) {
  return `${orderId}|${paymentId}`;
}

export function receiptFor(proposalId, nonce) {
  return `ah_${String(proposalId).replaceAll('-', '').slice(0, 14)}_${String(nonce).replaceAll('-', '').slice(0, 10)}`.slice(0, 40);
}
