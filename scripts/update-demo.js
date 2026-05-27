const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ildxgsvyvoipgoynijja.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZHhnc3Z5dm9pcGdveW5pamphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc1NzI3MiwiZXhwIjoyMDk1MzMzMjcyfQ.zFMzKRr0LUOumNG4Gd3BIE2tUoPQcGje0RnERn5usB8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const funnyUsernames = [
  'magicunicorn',
  'mrmoustache',
  'pizzawhisperer',
  'ninjasquirrel',
  'rocketpenguin',
  'thunderlama',
  'ghostpanda',
  'sillyoctopus',
];

async function updateDemo() {
  console.log('🎨 Updating demo data...\n');

  try {
    // Update usernames to funny names
    const newUsername1 = funnyUsernames[Math.floor(Math.random() * funnyUsernames.length)];
    const newUsername2 = funnyUsernames[Math.floor(Math.random() * funnyUsernames.length)];

    console.log('👤 Updating usernames...');

    const { error: updateUsersError } = await supabase
      .from('users')
      .update({ username: newUsername1 })
      .eq('email', 'aluminus99@gmail.com');

    if (updateUsersError) {
      console.error('❌ Error updating user 1:', updateUsersError.message);
      process.exit(1);
    }
    console.log(`✓ User 1: ${newUsername1} (aluminus99@gmail.com)`);

    const { error: updateUsers2Error } = await supabase
      .from('users')
      .update({ username: newUsername2 })
      .eq('email', 'mananmaroo99@gmail.com');

    if (updateUsers2Error) {
      console.error('❌ Error updating user 2:', updateUsers2Error.message);
      process.exit(1);
    }
    console.log(`✓ User 2: ${newUsername2} (mananmaroo99@gmail.com)\n`);

    // Add "Beta" prefix to all agent titles
    console.log('🤖 Updating agent titles...');

    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('id, title');

    if (fetchError) {
      console.error('❌ Error fetching agents:', fetchError.message);
      process.exit(1);
    }

    let updatedCount = 0;
    for (const agent of agents) {
      if (!agent.title.startsWith('Beta ')) {
        const { error: updateError } = await supabase
          .from('agents')
          .update({ title: `Beta ${agent.title}` })
          .eq('id', agent.id);

        if (updateError) {
          console.log(`⚠ Could not update "${agent.title}": ${updateError.message}`);
        } else {
          console.log(`✓ Beta ${agent.title}`);
          updatedCount++;
        }
      } else {
        console.log(`✓ Beta ${agent.title} (already prefixed)`);
      }
    }

    console.log(`\n✅ Demo data updated successfully!\n`);
    console.log('📊 Summary:');
    console.log(`  • Updated 2 usernames to funny names`);
    console.log(`  • Added "Beta" prefix to ${updatedCount} agents\n`);

    console.log('🔐 Updated login credentials:');
    console.log(`  Account 1: aluminus99@gmail.com / Abcde@12345 → Username: ${newUsername1}`);
    console.log(`  Account 2: mananmaroo99@gmail.com / Abcde@12345 → Username: ${newUsername2}\n`);

    console.log('🚀 Try these URLs:');
    console.log(`  • Browse: http://localhost:3000/agents`);
    console.log(`  • Login: http://localhost:3000/auth/login`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

updateDemo();
