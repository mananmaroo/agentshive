// One-off: move pure prompt/persona entries out of the Agent pool into the
// new "Perfect Prompt" category. Run with: node scripts/reclassify-perfect-prompts.js
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Minimal .env.local loader (repo has no dotenv dependency).
const envPath = path.join(__dirname, '..', '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// title -> the secondary category we keep alongside the new primary tag.
const TARGETS = {
  'Math Word Problem Solver': 'Education',
  'Flashcard Generator': 'Education',
  'Android Expert (Template)': 'Code Generation',
};

(async () => {
  for (const [title, keep] of Object.entries(TARGETS)) {
    const { data, error } = await supabase
      .from('agents')
      .update({ category: ['Perfect Prompt', keep] })
      .eq('title', title)
      .select('id, title, category');
    if (error) {
      console.error(`FAILED ${title}:`, error.message);
      process.exitCode = 1;
    } else if (!data || data.length === 0) {
      console.warn(`NO MATCH for "${title}" — row not found.`);
    } else {
      console.log(`OK ${title} -> [${data[0].category.join(', ')}]`);
    }
  }
})();
