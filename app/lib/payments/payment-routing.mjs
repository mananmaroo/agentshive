import { resolveServerPrice } from './razorpay-core.mjs';

export const PAYMENT_PROVIDER = Object.freeze({
  RAZORPAY: 'razorpay',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
});

const PAYPAL_PRESENTMENT_CURRENCIES = new Set([
  'USD',
  'CAD',
  'GBP',
  'EUR',
  'AUD',
  'SGD',
]);

function unsupportedCurrency(currency) {
  return Object.assign(
    new Error(`No active international payment provider supports ${currency} yet.`),
    {
      status: 409,
      code: 'PAYMENT_CURRENCY_UNSUPPORTED',
    },
  );
}

export function providerForPayment(country, currency) {
  const verifiedCountry = String(country || '').trim().toUpperCase();
  const presentmentCurrency = String(currency || '').trim().toUpperCase();

  if (verifiedCountry === 'IN') {
    if (presentmentCurrency !== 'INR') {
      throw new Error('India proposals must be paid through Razorpay in INR.');
    }
    return PAYMENT_PROVIDER.RAZORPAY;
  }

  if (presentmentCurrency === 'INR') {
    throw new Error('International proposals cannot use India pricing.');
  }

  if (PAYPAL_PRESENTMENT_CURRENCIES.has(presentmentCurrency)) {
    return PAYMENT_PROVIDER.PAYPAL;
  }

  throw unsupportedCurrency(presentmentCurrency);
}

export function resolvePaymentContract(organizationCountry, proposalCountry, priceBookId) {
  const verifiedCountry = String(organizationCountry || '').trim().toUpperCase();
  const approvedCountry = String(proposalCountry || '').trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(verifiedCountry) || verifiedCountry !== approvedCountry) {
    throw new Error('Proposal billing country does not match the verified business country.');
  }

  const price = resolveServerPrice(verifiedCountry, priceBookId);
  const provider = providerForPayment(verifiedCountry, price.currency);

  return Object.freeze({ ...price, provider });
}

export function requirePaymentProvider(contract, expectedProvider) {
  if (!contract || contract.provider !== expectedProvider) {
    throw Object.assign(new Error(`This proposal must be paid through ${contract?.provider || 'its approved provider'}.`), {
      status: 409,
      code: 'PAYMENT_PROVIDER_MISMATCH',
    });
  }
  return contract;
}
