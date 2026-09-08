export type PaymentProvider = 'razorpay' | 'paypal' | 'stripe';
export interface PaymentContract {
  amount: number;
  currency: string;
  label: string;
  billingCountry: string;
  market: string;
  priceBookId: string;
  provider: PaymentProvider;
}
export declare const PAYMENT_PROVIDER: Readonly<{
  RAZORPAY: 'razorpay';
  PAYPAL: 'paypal';
  STRIPE: 'stripe';
}>;
export declare function providerForPayment(country: unknown, currency: unknown): PaymentProvider;
export declare function resolvePaymentContract(organizationCountry: unknown, proposalCountry: unknown, priceBookId: unknown): PaymentContract;
export declare function requirePaymentProvider(contract: PaymentContract, expectedProvider: PaymentProvider): PaymentContract;
