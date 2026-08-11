import { resolveServerPrice } from './razorpay-core.mjs';

export const PAYMENT_PROVIDER = Object.freeze({
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
});

export function providerForBillingCountry(country) {
  return String(country || '').trim().toUpperCase() === 'IN'
    ? PAYMENT_PROVIDER.RAZORPAY
    : PAYMENT_PROVIDER.STRIPE;
}

export function resolvePaymentContract(organizationCountry, proposalCountry, priceBookId) {
  const verifiedCountry = String(organizationCountry || '').trim().toUpperCase();
  const approvedCountry = String(proposalCountry || '').trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(verifiedCountry) || verifiedCountry !== approvedCountry) {
    throw new Error('Proposal billing country does not match the verified business country.');
  }

  const price = resolveServerPrice(verifiedCountry, priceBookId);
  const provider = providerForBillingCountry(verifiedCountry);

  if (provider === PAYMENT_PROVIDER.RAZORPAY && price.currency !== 'INR') {
    throw new Error('India proposals must be paid through Razorpay in INR.');
  }
  if (provider === PAYMENT_PROVIDER.STRIPE && price.currency === 'INR') {
    throw new Error('International proposals cannot use India pricing.');
  }

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
