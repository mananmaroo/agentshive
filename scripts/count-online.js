const fs=require('fs'),path=require('path');const{createClient}=require('@supabase/supabase-js');
const envPath=path.join(__dirname,'..','.env.local');
for(const l of fs.readFileSync(envPath,'utf8').split('\n')){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');}
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
 const total=await sb.from('agents').select('*',{count:'exact',head:true});
 const team=await sb.from('users').select('id').eq('username','agentshive_team').maybeSingle();
 const teamAgents=await sb.from('agents').select('*',{count:'exact',head:true}).eq('creator_id',team.data?.id||'x');
 console.log('Total agents in DB (online in Browse):',total.count);
 console.log('Seeded by agentshive_team:',teamAgents.count);
})();
