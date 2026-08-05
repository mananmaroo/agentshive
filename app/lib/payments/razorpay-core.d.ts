/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
export type ServerPrice = { amount: number; currency: string; label: string; billingCountry: string; priceBookId: string };
export const PRICE_BOOK: Readonly<Record<string, Readonly<Record<string, Readonly<{ amount: number; currency: string; label: string }>>>>>;
export function resolveServerPrice(country: string, priceBookId: string): ServerPrice;
export function validProposalId(value: unknown): value is string;
export function validIdempotencyKey(value: unknown): value is string;
export function sameOrigin(requestUrl: string, origin: string | null): boolean;
export function secureSignature(payload: string, supplied: unknown, secret: string): boolean;
export function paymentSignaturePayload(orderId: string, paymentId: string): string;
export function receiptFor(proposalId: string, nonce: string): string;
