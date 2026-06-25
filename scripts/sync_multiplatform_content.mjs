// Pushes the multi-platform-rewritten team/<slug>.md content into the live DB.
// - Updates agent_files.file_content (file_type 'claude_md') for each agent in team/index.json,
//   keyed by the DB agent id stored in index.json.
// - Generalizes any "Uses Claude AI" wording in agents.description.
// Dry run by default. Pass --commit to actually write.
//
//   node scripts/sync_multiplatform_content.mjs           # dry run
//   node scripts/sync_multiplatform_content.mjs --commit  # write
import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const COMMIT = process.argv.includes('--commit');
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const idx = JSON.parse(readFileSync('AGENTS_CLAUDE_MD/team/index.json', 'utf8'));

let ok = 0, missingFile = 0, noRow = 0, descFixed = 0, errors = 0;

for (const e of idx) {
  const path = `AGENTS_CLAUDE_MD/team/${e.slug}.md`;
  if (!existsSync(path)) { console.log(`! no local file: ${path}`); missingFile++; continue; }
  const content = readFileSync(path, 'utf8');

  // sanity: rewritten files must contain the new section and no old one
  const good = content.includes('## Where it runs') && !content.includes('Running in Claude');
  const flag = good ? '' : '  <-- WARN: missing new section / old section present';

  // find the claude_md file row for this agent
  const { data: files, error: fe } = await admin
    .from('agent_files').select('id').eq('agent_id', e.id).eq('file_type', 'claude_md');
  if (fe) { console.log(`x fetch file ${e.slug}: ${fe.message}`); errors++; continue; }
  if (!files?.length) { console.log(`! no claude_md row for ${e.slug} (${e.id})`); noRow++; continue; }

  // description generalization
  let newDesc = null;
  if (/\bClaude AI\b/.test(e.description || '')) {
    newDesc = e.description.replace(/\bUses Claude AI\b/g, 'Uses an AI model')
                           .replace(/\bClaude AI\b/g, 'AI');
  }

  if (COMMIT) {
    for (const f of files) {
      const { error } = await admin.from('agent_files').update({ file_content: content }).eq('id', f.id);
      if (error) { console.log(`x update content ${e.slug}: ${error.message}`); errors++; }
    }
    if (newDesc) {
      const { error } = await admin.from('agents').update({ description: newDesc }).eq('id', e.id);
      if (error) { console.log(`x update desc ${e.slug}: ${error.message}`); errors++; }
      else descFixed++;
    }
  } else if (newDesc) {
    descFixed++;
  }

  ok++;
  console.log(`${COMMIT ? '+' : '·'} ${e.slug}  (${content.length} chars${newDesc ? ', desc fixed' : ''})${flag}`);
}

console.log(`\n${COMMIT ? 'COMMITTED' : 'DRY RUN'}: ${ok} agents, ${descFixed} descriptions, ${missingFile} missing files, ${noRow} no-row, ${errors} errors.`);
if (!COMMIT) console.log('Re-run with --commit to write.');
