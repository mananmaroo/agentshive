// Verify Companion / Perfect Prompt rows appear only in their own tab, not Browse.
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const browse = await supabase
    .from('agents')
    .select('title, category', { count: 'exact' })
    .not('category', 'cs', '{"Perfect Prompt"}')
    .not('category', 'cs', '{"Companion"}');
  if (browse.error) console.log('BROWSE error:', browse.error.message);

  const leaks = (browse.data || []).filter(a =>
    a.category?.includes('Perfect Prompt') || a.category?.includes('Companion'));

  const pp = await supabase.from('agents').select('title, category').contains('category', ['Perfect Prompt']);
  const comp = await supabase.from('agents').select('title, category').contains('category', ['Companion']);
  if (pp.error) console.log('PP error:', pp.error.message);
  if (comp.error) console.log('COMP error:', comp.error.message);

  console.log(`BROWSE returns ${browse.count} agents. Leaks: ${leaks.length}`);
  leaks.forEach(a => console.log(`   ⚠ ${a.title} [${a.category.join(', ')}]`));
  console.log(`\nPERFECT PROMPTS rows (${pp.data?.length || 0}):`);
  (pp.data || []).forEach(a => console.log(`   • ${a.title} [${a.category.join(', ')}]`));
  console.log(`\nCOMPANION-category rows (${comp.data?.length || 0}):`);
  (comp.data || []).forEach(a => console.log(`   • ${a.title} [${a.category.join(', ')}]`));
})();
