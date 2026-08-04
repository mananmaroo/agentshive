# Consultation-led business launch

## Public promise

AgentsHive Business presents workflow outcomes, not a library of already-built autonomous employees.

- Aarya admissions: controlled website pilot.
- Consultation available: discovery can start now; implementation is scoped afterward.
- Custom build: no delivery or integration claim until a proposal is agreed.
- Coming later: not available. Phone and voice must remain the final catalogue item.
- WhatsApp-ready means provider-neutral workflow design only. No WhatsApp provider is active.

## Consultation pipeline

`new → contacted → discovery → proposal → proposal_accepted → setup_fee_pending → setup_fee_paid → setup → acceptance_review → active → paused/closed`

The public request form does not create an account, start work, activate a channel or charge money. Administrative pipeline controls will be added to the secure admin portal after PR #17 is merged.

## Commercial policy captured by the form

- A scoped setup fee may be required before implementation.
- Once work begins, the setup fee is non-refundable except when AgentsHive cannot deliver the agreed core scope or applicable law requires otherwise.
- Monthly subscription billing does not begin before activation.
- Acceptance review lasts three business days for in-scope defect reports.
- Change requests and out-of-scope work are quoted separately.
- Cancellation during setup stops future work but does not refund completed or committed setup effort.
- Failed recurring payment will trigger notice, a three-day grace period, then workspace pause—not deletion.
- Final binding scope, fees, tax, refund and service terms belong in the accepted proposal.

## Integration disclosure

Clients provide and authorise required OAuth/integration accounts. Consumer ChatGPT or Claude subscriptions do not include production API usage. Model, messaging, CRM, email, storage and other provider charges must be disclosed in the proposal.

## Environment variables

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`
- `BUSINESS_REQUEST_HASH_SECRET` — random secret used only for one-way dedupe and rate-limit hashes

Do not add a `NEXT_PUBLIC_` prefix to either value.

## Founder notification

The database marks each request `notification_status=pending`; the secure admin workflow is the system of record. The success screen provides `info@agentshive.net` for follow-up. Transactional email requires a separately approved sender integration; this branch does not silently add one.

## Stripe boundary

No Stripe SDK, account, Product, Price, Checkout or webhook is added here. The future account must be a new AgentsHive Stripe account, not the connected Buy Me a Coffee account.

After consultation:
1. proposal accepted;
2. setup fee requested and verified;
3. setup proceeds;
4. client completes acceptance review;
5. subscription starts at activation;
6. verified webhooks maintain access;
7. failed payment enters three-day grace, then pauses access without deleting data.

## Exports

The authenticated dashboard offers CSV exports for leads, conversations and attention items. Each export:
- validates the Supabase user;
- relies on membership-scoped RLS;
- denies paused/archived organizations;
- caps at 1,000 rows;
- protects spreadsheet formula cells;
- sets private, no-store response headers.

XLSX and media bundles remain future work. Media export must not appear active until real organization-owned stored media exists.
