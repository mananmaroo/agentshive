# Razorpay + PayPal checkout — TEST-only rollout

## Decision

- Stripe execution is paused. No Stripe credential or runtime is accepted while only live credentials are available.
- India (`IN`) and INR route to Razorpay.
- Eligible non-India proposals route to PayPal only when their approved presentment currency is supported.
- Stripe remains a reserved provider type so it can be added later without another ledger redesign; no current contract selects it.
- No provider is activated merely because it exists in the enum.

The browser never selects a provider or supplies an amount, currency, billing country, or plan price. It submits only an approved proposal identifier and an idempotency key. The server resolves the verified organization country, approved proposal, exact minor-unit amount, currency and provider.

## Currency eligibility

PayPal supports the current USD, CAD, GBP, EUR, AUD and SGD price books.

The current UAE price book is AED, which PayPal does not support as a presentment currency. UAE/AED checkout is therefore held with a clear unsupported-provider error. Do not silently convert AED to USD or change the public price without separate pricing approval.

## Smallest safe PR sequence

1. **Routing core (this PR):** provider-neutral contract resolution, country/currency/provider enforcement, Razorpay endpoint guard, PayPal eligibility tests, inactive Stripe reservation, and safe AED hold. No schema change.
2. **Provider-neutral ledger migration (draft, unapplied):** add provider plus provider-scoped order, capture and webhook identifiers; retain historical Razorpay evidence; add provider-neutral payment status, entitlement term, setup-fee/service-fee allocation, webhook replay key and three-day grace fields.
3. **PayPal Sandbox Orders:** create an order server-side from the approved proposal; use `PayPal-Request-Id`; attach proposal, organization and price-book references; redirect to PayPal approval; capture only after authenticated return and revalidation.
4. **PayPal Sandbox webhook:** verify PayPal transmission headers with the configured webhook ID; deduplicate event IDs; retrieve order/capture server-side; verify proposal, organization, amount and currency; finalize access only after `PAYMENT.CAPTURE.COMPLETED`.
5. **Lifecycle:** map capture pending/denied/reversed/refunded and dispute events to provider-neutral states. For later recurring billing, payment failure enters the existing three-day grace policy before access is paused. Setup fees remain separately recorded and non-refundable only where the approved proposal explicitly says so.
6. **Unified checkout UI:** show provider, currency, Sandbox/TEST status and payment method. India never loads PayPal; eligible international proposals never load Razorpay; UAE/AED displays consultation/manual-payment follow-up until supported.
7. **Subscriptions later:** start with Orders for fixed prepaid monthly, six-month and twelve-month totals. Add PayPal Subscriptions only after recurring billing is intentionally approved because it requires per-currency products/plans and a larger renewal lifecycle.
8. **Production gate:** legal/merchant eligibility, sandbox matrix, webhook replay tests, observability, secret rotation and explicit approval before migration, merge, live credentials or charges.

## PayPal Sandbox requirements

Create these in the PayPal Developer Dashboard without using live credentials:

- A Sandbox REST app owned by a Sandbox business merchant account.
- A Sandbox personal buyer account for test approval.
- `PAYPAL_CLIENT_ID` — Preview/server configuration.
- `PAYPAL_CLIENT_SECRET` — Preview/server secret.
- `PAYPAL_WEBHOOK_ID` — identifier for the exact Preview webhook registration.
- `PAYPAL_ENV=sandbox` — validated server-side; the API base must resolve to `https://api-m.sandbox.paypal.com`.
- A stable Preview webhook URL subscribed to capture, refund/reversal and dispute events.

The OAuth access token is generated server-side and short-lived. It must never be committed, exposed to the browser, or stored as a long-lived environment variable.

## Sandbox verification matrix

- India/INR cannot create a PayPal order.
- Non-India cannot create a Razorpay order.
- Supported international currencies create an order for the exact approved total.
- UAE/AED is blocked before provider API access.
- Proposal country, organization membership, amount and currency tampering fail.
- Duplicate create requests return the same internal order outcome.
- Invalid webhook signatures and duplicate event IDs do not mutate access.
- Approved-but-uncaptured and pending captures do not grant access.
- Completed capture grants only the correct organization for the approved entitlement term.
- Refund, reversal, dispute and failed recurring events follow the provider-neutral audit and access policy.
- No route or test selects Stripe while it is inactive.

## Merchant limitations and commercial considerations

An India PayPal business account can receive eligible international payments, not domestic India payments. Razorpay therefore remains mandatory for India. PayPal charges international commercial transaction fees plus a currency-specific fixed fee; currency conversion, dispute and refund economics must be included in the final margin model. PayPal does not return the original receiving fee when a payment is refunded.

Settlement and automatic withdrawal behavior must be verified on the actual India merchant account before live launch. Sandbox evidence is necessary but not sufficient for production eligibility.
