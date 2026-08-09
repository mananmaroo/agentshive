import { createHmac, timingSafeEqual } from 'node:crypto';

const EURO_AREA = new Set([
  'AT', 'BE', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
]);

const DIRECT_MARKETS = Object.freeze({
  IN: 'IN',
  US: 'US',
  CA: 'CA',
  GB: 'GB',
  AU: 'AU',
  SG: 'SG',
  AE: 'AE',
});

function discountedTotal(monthlyMinor, months, discountPercent) {
  const undiscounted = monthlyMinor * months;
  return Math.round((undiscounted * (100 - discountPercent)) / 100);
}

function planPrices(starterMinor, premiumMinor, currency) {
  return Object.freeze({
    starter_monthly: Object.freeze({ amount: starterMinor, currency, label: 'Starter · Monthly' }),
    starter_6m: Object.freeze({ amount: discountedTotal(starterMinor, 6, 5), currency, label: 'Starter · 6 months' }),
    starter_12m: Object.freeze({ amount: discountedTotal(starterMinor, 12, 10), currency, label: 'Starter · 12 months' }),
    premium_monthly: Object.freeze({ amount: premiumMinor, currency, label: 'Premium · Monthly' }),
    premium_6m: Object.freeze({ amount: discountedTotal(premiumMinor, 6, 5), currency, label: 'Premium · 6 months' }),
    premium_12m: Object.freeze({ amount: discountedTotal(premiumMinor, 12, 10), currency, label: 'Premium · 12 months' }),
  });
}

export const PRICE_BOOK = Object.freeze({
  IN: planPrices(299900, 599900, 'INR'),
  US: planPrices(9900, 29900, 'USD'),
  CA: planPrices(13900, 41900, 'CAD'),
  GB: planPrices(7900, 23900, 'GBP'),
  EU: planPrices(8900, 26900, 'EUR'),
  AU: planPrices(14900, 44900, 'AUD'),
  SG: planPrices(12900, 38900, 'SGD'),
  AE: planPrices(36900, 109900, 'AED'),
  ROW: planPrices(9900, 29900, 'USD'),
});

export function marketForBillingCountry(country) {
  const normalizedCountry = String(country || '').trim().toUpperCase();
  return DIRECT_MARKETS[normalizedCountry] ?? (EURO_AREA.has(normalizedCountry) ? 'EU' : 'ROW');
}

export function resolveServerPrice(country, priceBookId) {
  const normalizedCountry = String(country || '').trim().toUpperCase();
  const normalizedId = String(priceBookId || '').trim();
  const market = marketForBillingCountry(normalizedCountry);
  const price = PRICE_BOOK[market]?.[normalizedId];
  if (!price || !Number.isSafeInteger(price.amount) || price.amount < 100) {
    throw new Error('No approved regional price exists for this proposal.');
  }
  return { ...price, billingCountry: normalizedCountry, market, priceBookId: normalizedId };
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
