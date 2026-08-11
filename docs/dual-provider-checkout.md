# Dual-provider checkout — TEST-only rollout

## Server-authoritative routing

The verified business billing country and approved proposal determine the provider:

- India (`IN`) and INR: Razorpay.
- Every eligible non-India country and its approved localized currency: Stripe.

The browser never selects the provider or supplies an amount, currency, billing country, or plan price. It submits only an approved proposal identifier and an idempotency key.

## Smallest safe PR sequence

1. **Routing core (this PR):** provider-neutral contract resolution, country/provider enforcement, Razorpay endpoint guard, and deterministic tests. No schema change.
2. **Provider-neutral ledger migration:** add provider and provider-specific identifiers without rewriting historical Razorpay evidence; add a provider-scoped webhook event key; add subscription/access lifecycle state and non-refundable setup-fee allocation. Migration remains unapplied until approved.
3. **Stripe TEST checkout:** server-created Checkout Session from the approved proposal; authenticated same-origin endpoint; idempotency; metadata for proposal, organization, customer, price-book and component allocation. No client amount or currency.
4. **Stripe TEST webhook:** raw-body signature verification, replay protection, server-side Session/PaymentIntent/Invoice retrieval, exact identity/amount/currency checks, and provider-neutral finalization RPC.
5. **Access lifecycle:** activate only from a paid/captured webhook; refund/dispute/failed recurring payment starts the existing three-day grace policy before revocation. Setup fees remain separately recorded and non-refundable where the approved proposal says so.
6. **Unified checkout UI:** show provider, currency, TEST status, and payment method clearly. India never loads Stripe Checkout; international proposals never load Razorpay.
7. **Production gate:** legal/merchant eligibility, test matrix, webhook replay tests, observability, secret rotation and explicit approval before migrations, merge, live keys or charges.

## Stripe TEST setup requirements

- An eligible Stripe merchant account capable of accepting the intended international currencies.
- TEST secret key and webhook signing secret, scoped to Preview only.
- A stable Preview webhook URL.
- Checkout and webhook events enabled for TEST mode.
- No live keys in Preview or source control.
- Server configuration for allowed origins and the existing Supabase service role.
