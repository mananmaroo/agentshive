import assert from 'node:assert/strict';
import { createHmac, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';

function signature(url, params, token) {
  const payload = url + Object.keys(params).sort().map((key) => key + params[key]).join('');
  return createHmac('sha1', token).update(payload).digest('base64');
}

const url = 'https://preview.example/api/voice/twilio/inbound';
const params = { CallSid: 'CA00000000000000000000000000000000', From: '+12025550123', To: '+16402610477' };
const expected = signature(url, params, 'test-token');
const actual = signature(url, params, 'test-token');
assert.equal(timingSafeEqual(Buffer.from(expected), Buffer.from(actual)), true);
assert.equal(signature(url, { ...params, To: '+12025550199' }, 'test-token') === expected, false);

const inbound = fs.readFileSync('app/api/voice/twilio/inbound/route.ts', 'utf8');
const turn = fs.readFileSync('app/api/voice/twilio/turn/route.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260801152000_twilio_inbound_voice_pilot.sql', 'utf8');
assert.ok(inbound.indexOf('DISCLOSURE') < inbound.indexOf('<Gather'), 'disclosure must precede collection');
assert.match(turn, /MAX_CALL_SECONDS/);
assert.match(turn, /UNKNOWN_REPLY/);
assert.match(turn, /business_record_voice_turn/);
assert.doesNotMatch(inbound + turn, /<Record|recording=true/i);
assert.doesNotMatch(inbound + turn, /outbound/i);
assert.match(migration, /voice_enabled boolean not null default false/);
assert.match(migration, /voice_recording_enabled boolean not null default false/);
assert.match(migration, /voice_monthly_spend_limit_usd/);
assert.match(migration, /provider_call_sid_hash/);
console.log('Voice pilot fixture and safety checks passed.');
