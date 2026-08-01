# Aarohan inbound voice pilot (gated)

This branch prepares a zero-cost-testable, inbound-only US voice pilot. It does **not** purchase a number, configure forwarding, add credentials, enable calls, or merge to production.

## Runtime choice

The first pilot uses Twilio Programmable Voice speech `<Gather>` webhooks because it works within ordinary Vercel Functions and can be replayed with signed HTTP fixtures. ConversationRelay requires a persistent public WebSocket. Vercel's WebSocket support is currently public beta and duration-bound, so ConversationRelay remains an evaluated follow-up after the HTTP pilot is stable.

## Server-only Vercel variables

Required before any real call:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VOICE_NUMBER`
- `VOICE_WEBHOOK_BASE_URL` — exact public HTTPS origin used by Twilio
- `SUPABASE_SERVICE_ROLE_KEY`

Safe gates and policy:

- `VOICE_GLOBAL_ENABLED=false` until explicit approval
- `VOICE_OUTBOUND_ENABLED=false` permanently for this pilot
- `VOICE_MAX_CALL_SECONDS=300`
- `VOICE_AI_DISCLOSURE`
- `VOICE_DAILY_SPEND_LIMIT_USD=10`
- `VOICE_MONTHLY_SPEND_LIMIT_USD=40`
- `VOICE_RECORDING_ENABLED=false`
- `VOICE_TRANSCRIPT_RETENTION_DAYS=30`

Preview-only simulator:

- `VOICE_SIMULATOR_ENABLED=true`
- `VOICE_SIMULATOR_SECRET` — random server-only value

Never use a `NEXT_PUBLIC_` prefix for Twilio credentials or simulator secrets.

## Account prerequisites

1. Twilio trial may test inbound calls only from verified caller IDs and plays a trial announcement.
2. A public pilot requires an upgraded/funded Twilio account.
3. Choose one US local number that explicitly supports Voice.
4. The existing US number stays with its carrier; forward it to the Twilio number later or port it. Verified Caller ID does not make it an inbound Twilio number.
5. Configure the Twilio number's incoming webhook to `POST /api/voice/twilio/inbound` and status callback to `POST /api/voice/twilio/status`.
6. Store secrets in Vercel Preview first, then Production only after approval.

## Activation gates

All must remain false/unset until Manan explicitly approves the displayed costs:

- Twilio account upgrade/funding
- Number purchase
- Carrier forwarding
- Production credentials
- Database `voice_enabled=true` / `voice_status='active'`
- Vercel `VOICE_GLOBAL_ENABLED=true`
- Live inbound test
- Paid transfer leg

There is no outbound-call route.

## Safety behavior

- AI disclosure is the first spoken content.
- No audio recording.
- Five-minute maximum.
- Approved knowledge only.
- Unknown or sensitive questions create attention items; no guessing.
- Human transfer uses only the organization-configured E.164 number.
- Dedicated Twilio number maps the call to exactly one organization.
- Daily call count and monthly provider-cost gate are checked before a session.
- Call IDs are stored only as SHA-256 hashes.
- Transcript retention is capped at 90 days.

## Pilot budget

Current public US pricing is approximately $1.15/month for one local number, $0.0085/min inbound Voice, and $0.07/min for ConversationRelay if enabled later. At ConversationRelay rates, 500 minutes is about $40.40 before forwarding charges or model usage. Start with 100 minutes (about $9 including the number), alerts at $10/$25/$40, auto-recharge off, and a hard 400–500 minute ceiling. The deterministic approved-knowledge engine adds no model charge.

## Countries

Start with the US Twilio number and inbound calls only. International callers may dial it subject to their carrier charges. Non-US number purchasing, international forwarding/porting, outbound geographic permissions, and additional regulatory bundles are outside this pilot.
