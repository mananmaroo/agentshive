/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
# Razorpay Standard Checkout — gated rollout

This draft adds test-ready checkout code only. It performs no real transaction and must remain behind PR #17 → PR #20 → PR #21.

## Required secure environment variables

- `RAZORPAY_KEY_ID` — server-only test key ID; return it only in the authenticated order response.
- `RAZORPAY_KEY_SECRET` — server-only rotated test secret.
- `RAZORPAY_WEBHOOK_SECRET` — server-only webhook signing secret.
- Existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`.

Never use credentials pasted into chat. Rotate them in Razorpay first. Do not add the secret to `NEXT_PUBLIC_*`, source control, screenshots, logs, or client bundles.

## Manual test-mode setup

1. Rotate exposed credentials in Razorpay and create fresh **test-mode** API keys.
2. Add the three Razorpay variables to the Vercel Preview environment only.
3. Apply `20260805120000_razorpay_payment_integrity.sql` after the PR #17 access migration.
4. Create an approved payment proposal from the server/admin path with the verified organization billing country and a server price-book ID.
5. Register the Preview webhook URL `/api/business/payments/razorpay/webhook`; subscribe to captured, authorized, failed, refund processed, and dispute created events.
6. Use Razorpay test instruments only. Confirm browser completion remains `pending_webhook` until a captured webhook arrives.
7. Confirm duplicate webhook delivery is acknowledged once, failed/refunded/disputed events revoke access, and a US organization cannot use India pricing.

## Release gate

Do not configure Production keys, promote the migration, or accept real money until PR #17 access tests, PR #20 marketplace tests, PR #21 demo tests, Razorpay test-mode callbacks, refunds/disputes, RLS, and a legal/commercial review all pass.
