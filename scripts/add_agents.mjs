// Removes the two near-duplicate beta agents and adds new useful agents.
// Each new agent gets a real claude.md in agent_files.file_content so /raw works.
//   node scripts/add_agents.mjs
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n')
  .filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const TEAM = 'a6cb0219-ec81-4003-8727-6c9e536cb997'; // agentshive_team
const OCTO = 'bc4a87fe-3e46-42d4-9760-f7544c1195d3'; // sillyoctopus
const PENGUIN = '109fbbb0-483a-43e4-96b0-995edbea5d13'; // rocketpenguin

// --- 1. Remove the two duplicates of the real agents ---
const DUPES = [
  'b4147431-0bf1-4de3-9c11-48ca4746d638', // Beta AI Job Search Assistant (dup of AI Job Application Automation)
  '3acd6826-edb0-4b1c-a874-5417fecc6ab1', // Beta Customer Feedback Processor (dup of Customer Feedback Distributor)
];
for (const id of DUPES) {
  for (const t of ['comments', 'ratings', 'agent_files']) {
    const { error } = await admin.from(t).delete().eq('agent_id', id);
    if (error && !/does not exist|find the table|schema cache/i.test(error.message))
      console.log(`  warn deleting ${t} for ${id}: ${error.message}`);
  }
  const { error } = await admin.from('agents').delete().eq('id', id);
  console.log(error ? `✗ delete agent ${id}: ${error.message}` : `✓ removed duplicate ${id}`);
}

// --- 2. New agents ---
const newAgents = [
  {
    title: 'PDF Reader & Summarizer',
    creator_id: TEAM, verified: true,
    description: 'Reads a PDF (reports, papers, contracts, manuals) and returns a clear structured summary — TL;DR, key points, and any action items or deadlines. Handles long, multi-page documents.',
    category: ['Research', 'Documentation'],
    tags: ['pdf', 'summarization', 'documents', 'research', 'reading'],
    license: 'MIT', version: '1.0.0',
    content: `# PDF Reader & Summarizer

## Purpose

Read a PDF document and produce a clear, structured summary so the user understands it in under a minute — even if the original is dozens of pages.

## Inputs

- A path or URL to a PDF file.
- (Optional) what the user cares about most: "focus on the financials", "pull every deadline", etc.

## Instructions

1. Open the PDF and extract its text page by page. If it is scanned (image-only), run OCR first.
2. Detect the document type (report, research paper, contract, manual, invoice, slide deck) and adapt the summary shape to it.
3. Produce the output below. Never invent facts that aren't in the document — if something is unclear, say so.
4. Quote exact figures, dates, names, and clauses; cite the page number in parentheses, e.g. "(p. 4)".
5. If the user asked to focus on something, lead with that.

## Output Format

**TL;DR** — 2-3 sentences capturing the whole document.

**Key Points** — 5-8 bullets, each with a page reference.

**Numbers & Dates** — a short table of any important figures, amounts, or deadlines.

**Action Items** — anything the reader must do, decide, or respond to (with due dates if present). Write "None found" if there are none.

**Open Questions** — anything ambiguous or missing that the reader should clarify.

## Notes

Runtime-agnostic — works with Claude Code, Codex, n8n, or LangChain. For very large PDFs, summarize per section first, then summarize the summaries.
`,
  },
  {
    title: 'YouTube Video Summarizer',
    creator_id: OCTO, verified: false,
    description: 'Give it a YouTube link and it pulls the transcript and returns a tight summary with timestamped highlights and the main takeaways — so you can skip a 40-minute video in 60 seconds.',
    category: ['Research', 'Content Creation'],
    tags: ['youtube', 'video', 'summary', 'transcript', 'research'],
    license: 'MIT', version: '1.0.0',
    content: `# YouTube Video Summarizer

## Purpose

Turn any YouTube video into a fast, skimmable summary so the user gets the value without watching the whole thing.

## Inputs

- A YouTube URL.
- (Optional) desired length: "one paragraph" or "detailed notes".

## Instructions

1. Fetch the video's transcript (captions). If captions are unavailable, say so and stop.
2. Read the full transcript and identify the main thesis and the supporting sections.
3. Group the content into 4-7 segments and note the timestamp where each begins.
4. Write the output below. Keep the creator's claims as claims — don't present opinions as facts.

## Output Format

**In one line:** what the video is about.

**Main Takeaways:** 3-5 bullets — the things worth remembering.

**Timestamped Highlights:** \`[mm:ss]\` + a short description of each key moment.

**Worth watching if:** one line on who should actually watch the full video.

## Notes

Runtime-agnostic. Pair with the PDF Reader & Summarizer when researching a topic across both videos and documents.
`,
  },
  {
    title: 'Meeting Notes & Action Items',
    creator_id: PENGUIN, verified: false,
    description: 'Paste a meeting transcript or recording text and get clean notes: decisions made, action items with owners and due dates, and a short recap you can send to the team.',
    category: ['Automation', 'Content Creation'],
    tags: ['meetings', 'notes', 'action-items', 'transcription', 'productivity'],
    license: 'MIT', version: '1.0.0',
    content: `# Meeting Notes & Action Items

## Purpose

Convert a raw meeting transcript into notes a team can actually use: what was decided, who owns what, and a recap ready to paste into Slack or email.

## Inputs

- A meeting transcript or notes (text).
- (Optional) the list of attendees, to attribute action items correctly.

## Instructions

1. Read the transcript and separate discussion from decisions.
2. Extract every action item. For each, capture the owner and a due date if one was mentioned (write "unassigned" / "no date" otherwise).
3. Do not invent owners or dates — only use what's in the transcript.
4. Keep it concise; cut filler and small talk.

## Output Format

**Recap** — 3-4 sentences a busy person can read in 15 seconds.

**Decisions** — bullet list of what was agreed.

**Action Items** — a table: \`Owner | Task | Due\`.

**Follow-ups / Parking Lot** — anything raised but not resolved.

## Notes

Runtime-agnostic. Works great as an n8n step triggered after a call recording is transcribed.
`,
  },
  {
    title: 'Invoice & Receipt Extractor',
    creator_id: TEAM, verified: true,
    description: 'Reads invoices and receipts (PDF or image) and pulls the data into clean structured JSON or a CSV row — vendor, date, line items, tax, and total — ready for your bookkeeping.',
    category: ['Data Analysis', 'Automation'],
    tags: ['invoice', 'receipt', 'data-extraction', 'finance', 'bookkeeping'],
    license: 'MIT', version: '1.0.0',
    content: `# Invoice & Receipt Extractor

## Purpose

Extract structured data from invoices and receipts so they can be logged into a spreadsheet or accounting tool without manual typing.

## Inputs

- An invoice or receipt as a PDF or image. OCR it if it's a photo or scan.

## Instructions

1. Read the document and locate the standard fields below.
2. Normalize dates to \`YYYY-MM-DD\` and amounts to a number plus a 3-letter currency code (e.g. \`1240.50 EUR\`).
3. Capture every line item; if quantities or unit prices are present, include them.
4. If a field is missing or unreadable, set it to \`null\` — never guess.
5. Re-check that line items + tax sum to the stated total; flag any mismatch.

## Output Format

Return JSON:

\`\`\`json
{
  "vendor": "",
  "invoice_number": "",
  "date": "YYYY-MM-DD",
  "currency": "EUR",
  "line_items": [{ "description": "", "qty": 1, "unit_price": 0, "amount": 0 }],
  "subtotal": 0,
  "tax": 0,
  "total": 0,
  "notes": ""
}
\`\`\`

If the user prefers a spreadsheet, also emit a single CSV row with a header.

## Notes

Runtime-agnostic. Chain after the PDF Reader for mixed document batches.
`,
  },
];

let added = 0;
for (const a of newAgents) {
  const { content, ...row } = a;
  const { data: agent, error } = await admin.from('agents').insert({
    ...row,
    downloads_count: 0, views_count: 0, average_rating: 0, rating_count: 0, featured: false,
  }).select().single();
  if (error) { console.log(`✗ insert ${a.title}: ${error.message}`); continue; }
  const { error: fe } = await admin.from('agent_files').insert({
    agent_id: agent.id, file_url: `agent-${agent.id}-claude.md`,
    file_type: 'claude_md', file_name: 'claude.md', file_content: content,
  });
  if (fe) { console.log(`✗ file for ${a.title}: ${fe.message}`); continue; }
  added++;
  console.log(`✓ added ${a.title}  (${agent.id}, ${content.length} chars)`);
}

const { count } = await admin.from('agents').select('*', { count: 'exact', head: true });
console.log(`\nDone. ${added} added. Total agents now: ${count}`);
