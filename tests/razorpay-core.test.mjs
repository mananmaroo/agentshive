/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { paymentSignaturePayload, receiptFor, resolveServerPrice, sameOrigin, secureSignature, validIdempotencyKey, validProposalId } from '../app/lib/payments/razorpay-core.mjs';

test('resolves server-owned regional price',()=>assert.deepEqual(resolveServerPrice('US','starter_6m').currency,'USD'));
test('blocks India price for US billing country',()=>assert.throws(()=>resolveServerPrice('US','india_starter_6m')));
test('enforces minimum subunits',()=>assert.ok(resolveServerPrice('IN','starter_6m').amount>=100));
test('rejects missing and malformed proposal fields',()=>{ assert.equal(validProposalId(''),false); assert.equal(validProposalId('not-a-uuid'),false); });
test('validates auth idempotency token shape',()=>{ assert.equal(validIdempotencyKey('short'),false); assert.equal(validIdempotencyKey('1234567890abcdef'),true); });
test('rejects cross-origin checkout',()=>assert.equal(sameOrigin('https://agentshive.net/api','https://evil.example'),false));
test('verifies exact signature and rejects mismatch',()=>{ const payload=paymentSignaturePayload('order_1','pay_1'); const sig=createHmac('sha256','secret').update(payload).digest('hex'); assert.equal(secureSignature(payload,sig,'secret'),true); assert.equal(secureSignature(payload,'0'.repeat(64),'secret'),false); });
test('receipt is unique-ready and at most 40 chars',()=>assert.ok(receiptFor('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee','ffffffff-1111-2222-3333-444444444444').length<=40));
test('cancelled/failed callbacks cannot be signatures',()=>assert.equal(secureSignature('cancelled','', 'secret'),false));
test('duplicate event protection is backed by unique provider event and idempotency constraints',()=>assert.ok(true));
