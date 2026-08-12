import test from 'node:test';import assert from 'node:assert/strict';import {scoreLead,prepareDraft,dedupeKey} from '../app/lib/lead-pilot-core.mjs';
const lead={organizationName:'Example Institute',publicContactEmail:'ADMISSIONS@EXAMPLE.ORG',publicContactRole:'admissions',websiteUrl:'https://example.org',country:'India',sourceUrl:'https://example.org/contact',fitSignals:['Admissions','High enquiry volume']};
test('scoring is deterministic and bounded',()=>{assert.deepEqual(scoreLead(lead),scoreLead(lead));assert.equal(scoreLead(lead).score,85)});
test('draft is approval-first and contains no send action',()=>{const d=prepareDraft(lead);assert.match(d.body,/does not send messages autonomously/);assert.match(d.body,/https:\/\/example.org\/contact/)});
test('dedupe normalizes business email',()=>assert.equal(dedupeKey(' Example ','A@B.COM'),'example::a@b.com'));
