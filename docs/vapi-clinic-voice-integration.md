# Vapi Clinic Voice Pilot — Integration Guide

> Planning document only. No provider, phone number, paid AI model, or live calling is activated by this guide.

## What this creates

A clinic can receive an inbound call through an approved voice provider. The caller hears a clear AI-assistant disclosure, asks an administrative question, receives an answer only from the clinic’s approved knowledge, requests an appointment, or transfers to a person.

AgentsHive keeps the clinic workflow independent from any one telephone company:

```text
Caller
  → client-owned or provider number
  → voice-provider adapter (Vapi internationally; Exotel or another compliant provider in India)
  → AgentsHive voice session
  → approved clinic knowledge and appointment rules
  → human transfer or safe fallback
  → clinic dashboard and limited audit record
```

Vapi is one possible international adapter. It is not the business logic and must be replaceable.

## 1. Account and test workspace

1. Create a Vapi account using the company-controlled email address.
2. Keep the workspace in test/development mode.
3. Invite only the minimum administrators.
4. Enable multi-factor authentication when available.
5. Do not add funds, buy a number, or enable international calling until the pilot and budget are approved.
6. Record which countries the account and chosen carrier actually support. Availability, identity checks and local rules vary by country.

## 2. Assistant configuration

Create one assistant per clinic only for the first pilot. Configure:

- Name: a neutral local name selected with the clinic.
- First words: “Hello, you’re speaking with an AI assistant for [Clinic]. I can help with general information and appointment requests. You can ask for a person at any time.”
- Scope: administrative information and appointment intake only.
- Languages: only languages tested with that clinic.
- Maximum call: five minutes for the first pilot.
- Outbound calls: disabled.
- Recording: disabled by default.
- Unknown or sensitive answer: do not guess; offer human transfer or a callback.
- Medical advice, diagnosis, emergencies, prescriptions and treatment decisions: always out of scope.

The assistant prompt must refer to an AgentsHive policy and knowledge service rather than embedding permanent clinic facts directly in Vapi.

## 3. Phone-number options

Use one of these options after approval:

1. **Provider number:** obtain a Vapi-compatible number for a supported country.
2. **Client-owned number forwarding:** the clinic forwards inbound calls to the approved provider number.
3. **Imported/SIP number:** connect a client-owned number only where the carrier and provider explicitly support it.
4. **India:** use a client-owned Exotel or another compliant Indian provider through the same AgentsHive adapter interface when available.

Never promise that an existing number can be ported or imported before the carrier confirms it. Keep outbound calling disabled.

## 4. Clinic knowledge

During onboarding, the clinic approves public or uploaded material such as:

- opening hours and locations;
- services and practitioner directory;
- appointment policies;
- accepted payment or insurance information;
- accessibility and parking information;
- approved preparation instructions;
- transfer and emergency contacts.

Each knowledge item needs a source, approval state, organization ID and last-reviewed date. The runtime may retrieve only approved records belonging to the active clinic. If no approved source supports an answer, the assistant says it does not know and escalates.

## 5. Appointment workflow

For the first version:

1. Ask for the service or department.
2. Collect the caller’s name and preferred callback method only after consent.
3. Collect preferred day/time.
4. Read back the request.
5. Create an appointment request, not a confirmed booking, unless the clinic has approved a calendar integration.
6. Provide a reference number.
7. Notify the clinic’s attention queue.
8. Do not collect detailed medical history or payment-card information on the call.

Calendar writes remain disabled until client-owned OAuth access, availability rules and conflict tests pass.

## 6. Human transfer

Each clinic configures:

- transfer destination;
- opening hours;
- fallback voicemail or callback process;
- emergency wording;
- transfer timeout;
- after-hours behavior.

Transfer immediately when requested, when confidence is low, when a question is sensitive, or when the caller reports an emergency. Do not represent the AI as a clinician.

## 7. Consent, disclosure and privacy

Before collecting personal information:

- disclose that the caller is speaking with an AI assistant;
- explain the limited administrative purpose;
- allow the caller to request a person;
- state whether a transcript or summary will be retained;
- obtain any consent required in the caller’s location.

Recording stays off by default. If a clinic later requests recording, legal review, explicit consent, retention limits and separate approval are required.

Store the minimum transcript or structured summary. Configure per-clinic retention and deletion. Avoid storing medical details unless the clinic has completed the appropriate privacy, security and legal review.

## 8. Webhooks and verification

Vapi sends server-to-server events to an AgentsHive Vercel route. The route must:

1. accept only HTTPS POST requests;
2. preserve the raw request body when required for signature verification;
3. verify the provider signature or server secret before parsing actions;
4. reject missing, invalid, expired or replayed events;
5. resolve the clinic from a server-owned provider-number or assistant mapping;
6. never trust an organization ID supplied by the caller;
7. apply the same effective-access gate used by the dashboard and runtime;
8. record idempotency keys and process each event once;
9. rate-limit calls and tool actions;
10. redact secrets and sensitive content from logs.

## 9. Provider-neutral interface

AgentsHive should expose an internal interface similar to:

```ts
interface VoiceProvider {
  verifyWebhook(request: Request): Promise<VerifiedVoiceEvent>;
  startInboundSession(event: VerifiedVoiceEvent): Promise<VoiceSession>;
  sendAssistantResponse(sessionId: string, text: string): Promise<void>;
  transferToHuman(sessionId: string, destinationId: string): Promise<void>;
  endCall(sessionId: string, reason: string): Promise<void>;
}
```

Implement adapters such as `VapiVoiceProvider` and, later, `ExotelVoiceProvider`. The approved-knowledge, appointment, consent, retention, access and spend policies remain inside AgentsHive.

## 10. Per-client routing

Create server-owned mappings for:

- provider;
- provider workspace;
- provider assistant ID;
- inbound number ID;
- AgentsHive organization ID;
- approved knowledge set;
- language policy;
- transfer destination;
- retention policy;
- maximum call duration;
- daily/monthly spend limit;
- active/test/disabled state.

These mappings must not be readable across organizations. Revoked, expired or unpaid access immediately blocks the runtime and offers a safe human fallback.

## 11. Spend controls

Before any live test:

- set a maximum five-minute call;
- allow one inbound number and one clinic;
- block outbound calls;
- cap simultaneous calls;
- cap daily call count;
- set provider and AgentsHive monthly budgets;
- alert at 50%, 75% and 90%;
- stop new AI sessions at 100%;
- measure cost per minute, call and qualified appointment request.

A budget cap in AgentsHive complements—not replaces—the provider’s billing limit.

## 12. International availability and India

Vapi can be evaluated for supported international pilots, but number availability, caller ID, emergency-call rules, data residency, consent and identity requirements differ by country. Confirm the exact destination and carrier before committing to a customer.

For India, do not assume a Vapi-provided number is suitable. Plan for the clinic to own an Exotel or other compliant provider account and number. AgentsHive connects through the provider-neutral adapter only after the clinic and provider complete local verification.

## 13. Environment variables

Add names only; never commit values:

```text
VOICE_PROVIDER_DEFAULT=vapi
VAPI_API_KEY=
VAPI_WEBHOOK_SECRET=
VAPI_BASE_URL=
VOICE_WEBHOOK_BASE_URL=
VOICE_TRANSCRIPT_RETENTION_DAYS=
VOICE_MAX_CALL_SECONDS=300
VOICE_DAILY_CALL_LIMIT=
VOICE_MONTHLY_SPEND_LIMIT_MINOR=
VOICE_OUTBOUND_ENABLED=false
```

Client-specific assistant, phone-number and transfer identifiers belong in protected Supabase rows, not public environment variables. No secret may use a `NEXT_PUBLIC_` prefix.

## 14. Vercel and Supabase responsibilities

**Vercel**

- authenticated admin configuration routes;
- verified inbound webhook route;
- provider adapters;
- approved-knowledge and appointment tools;
- rate limiting, idempotency and structured error logs;
- no secret returned to the browser.

**Supabase**

- organization-owned voice configuration;
- approved knowledge and source references;
- sessions, tool actions, attention items and consent state;
- transcript/summary retention metadata;
- organization membership and effective-access checks;
- RLS on every exposed table;
- admin audit records for activation, disablement and policy changes.

Any new exposed table requires explicit Data API grants where configured, RLS, organization ownership policies and allow/deny tests.

## 15. Safe test sequence

1. Unit-test provider signature verification with fixtures.
2. Test replay rejection and idempotency.
3. Test the adapter with mocked provider events.
4. Use Vapi’s non-billable test capability where available.
5. Test approved answer with a source citation.
6. Test unknown, medical and emergency questions.
7. Test human transfer without connecting a real destination.
8. Test retention deletion.
9. Test wrong-organization and revoked-access denial.
10. With written approval, run one bounded inbound test call.
11. Review transcript, cost and escalation before any second call.

## 16. Production-readiness gates

Do not activate calling until all are true:

- signed clinic pilot agreement and responsible contact;
- supported country, provider and number confirmed;
- rotated secrets stored only in the correct Vercel environment;
- webhook verification, replay protection and rate limits pass;
- approved clinic knowledge and safe fallbacks pass;
- disclosure, consent, privacy and retention wording approved;
- human transfer and after-hours fallback tested;
- organization isolation and effective-access tests pass;
- recording off;
- outbound calling off;
- spend caps and alerts confirmed;
- monitoring and incident-disable control tested;
- one supervised test call approved by the founder.

Until these gates pass, the website must say **consultation-led**, **integration-dependent**, and **live calling is not available today**.
