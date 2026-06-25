const fs=require('fs'),path=require('path');const{createClient}=require('@supabase/supabase-js');
const envPath=path.join(__dirname,'..','.env.local');
for(const l of fs.readFileSync(envPath,'utf8').split('\n')){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');}
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
 const{data}=await sb.from('agents').select('title,category,tags').order('title');
 const tpl=data.filter(a=>/\(Template\)/i.test(a.title));
 const team=data.filter(a=>!/\(Template\)/i.test(a.title));
 console.log('TOTAL:',data.length,'| (Template):',tpl.length,'| non-template:',team.length);
 console.log('\n=== NON-TEMPLATE agents (title — category) ===');
 team.forEach(a=>console.log(`  ${a.title}  ::  [${(a.category||[]).join(', ')}]`));
 console.log('\n=== sample of (Template) titles (first 30) ===');
 tpl.slice(0,30).forEach(a=>console.log(`  ${a.title}  ::  [${(a.category||[]).join(', ')}]`));
})();
