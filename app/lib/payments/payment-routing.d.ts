export type PaymentProvider = 'razorpay' | 'stripe';
export interface PaymentContract {
  amount: number;
  currency: string;
  label: string;
  billingCountry: string;
  market: string;
  priceBookId: string;
  provider: PaymentProvider;
}
export declare const PAYMENT_PROVIDER: Readonly<{ RAZORPAY: 'razorpay'; STRIPE: 'stripe' }>;
export declare function providerForBillingCountry(country: unknown): PaymentProvider;
export declare function resolvePaymentContract(organizationCountry: unknown, proposalCountry: unknown, priceBookId: unknown): PaymentContract;
export declare function requirePaymentProvider(contract: PaymentContract, expectedProvider: PaymentProvider): PaymentContract;
