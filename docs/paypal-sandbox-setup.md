# PayPal Sandbox setup for AgentsHive

This is TEST-only. Do not create or enter live PayPal credentials.

## Preview environment variables

Add these to the Vercel **agentstack** project with **Preview scope only**:

| Name | Sensitive | Value source |
|---|---:|---|
| `PAYPAL_CLIENT_ID` | Yes in Vercel | Sandbox REST app Client ID |
| `PAYPAL_CLIENT_SECRET` | Yes | Sandbox REST app Secret |
| `PAYPAL_WEBHOOK_ID` | No, but keep server-only | Sandbox webhook registration |
| `PAYPAL_ENV` | No | exactly `sandbox` |
| `PAYPAL_SANDBOX_ENABLED` | No | exactly `true` |

Do not create any `NEXT_PUBLIC_PAYPAL_*` variable. The client ID stays server-side. AgentsHive creates the order on the server and returns only PayPal's Sandbox approval URL.

Production must keep these variables absent while this PR is under review.

## Stable Preview webhook

Use this exact branch-alias endpoint:

`https://agentstack-git-codex-paypal-sa-eb7f84-maroomanan-5713s-projects.vercel.app/api/business/payments/paypal/webhook`

The route is:

`POST /api/business/payments/paypal/webhook`

Do not use a one-off deployment hostname; use the stable branch alias above.

## Sandbox webhook events

Subscribe the Sandbox REST app to:

- `CHECKOUT.ORDER.APPROVED`
- `CHECKOUT.PAYMENT-APPROVAL.REVERSED`
- `PAYMENT.CAPTURE.PENDING`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`
- `PAYMENT.CAPTURE.REVERSED`
- `CUSTOMER.DISPUTE.CREATED`
- `CUSTOMER.DISPUTE.UPDATED`
- `CUSTOMER.DISPUTE.RESOLVED`

Do not add subscription events yet. They belong to the later recurring-billing workstream.

## What Manan can configure now

1. Open the PayPal Developer Dashboard and select **Sandbox**.
2. Under Sandbox accounts, create or retain:
   - one Business merchant test account;
   - one Personal buyer test account.
3. Under Apps & Credentials, select **Sandbox** and create a REST app named **AgentsHive Preview Sandbox**.
4. Copy the Sandbox Client ID and Secret directly into Vercel Preview environment variables. Never paste them into chat or source control.
5. Set `PAYPAL_ENV=sandbox` and `PAYPAL_SANDBOX_ENABLED=true` in Preview only.
6. Wait until this branch Preview is READY.
7. Add the stable webhook URL above to that exact Sandbox REST app and select the listed events.
8. Copy the resulting Webhook ID into `PAYPAL_WEBHOOK_ID` in Vercel Preview.
9. Redeploy the branch Preview so all five variables are present.
10. Stop. Do not create an order or approve a Sandbox payment until migration and transaction gates are separately approved.

## What must wait for PR and migration approval

- Applying `supabase/migrations/20260811121500_provider_neutral_payment_ledger.sql`.
- Creating any PayPal order.
- Redirecting to PayPal approval.
- Capturing a Sandbox payment.
- Mutating client access from a webhook.
- Testing refund or dispute events against a real ledger row.
- Merging either the routing or PayPal branch.
- Adding Production or live credentials.

## Exact migration approval gate

Migration application requires a new explicit message that identifies the file:

> I approve applying `20260811121500_provider_neutral_payment_ledger.sql` to the approved test/Preview Supabase environment only.

That approval does not authorize Production, a PayPal transaction, a live credential, or a merge.

Before asking for that approval, the following must be complete:

- PR diff and SQL safety review;
- build and deterministic payment tests passing;
- pgTAP checks run on an isolated/test database;
- confirmed backup/recovery path;
- confirmation that the target is the intended test/Preview Supabase project;
- confirmation that Production is not targeted.

A second, separate approval is required before one Sandbox order/capture test.
