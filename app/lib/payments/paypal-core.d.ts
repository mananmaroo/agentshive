import type { PaymentContract } from './payment-routing.mjs';

export declare const PAYPAL_SANDBOX_BASE: 'https://api-m.sandbox.paypal.com';
export declare function minorToPayPalValue(amount: number): string;
export declare function entitlementMonths(priceBookId: unknown): 1 | 6 | 12;
export declare function paypalInvoiceId(proposalId: unknown, nonce: unknown): string;
export declare function buildPayPalOrder(
  contract: PaymentContract,
  proposal: { id: string },
  organization: { id: string },
  invoiceId: string,
  returnUrl: string,
  cancelUrl: string,
): Record<string, unknown>;
export declare function approvalUrl(order: { links?: Array<{ rel?: string; href?: string }> }): string;
export declare function classifyPayPalEvent(eventType: string, resource: Record<string, any>): string;
export declare function validPayPalProviderId(value: unknown): boolean;
