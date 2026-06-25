const fs=require('fs'),path=require('path');const{createClient}=require('@supabase/supabase-js');
const envPath=path.join(__dirname,'..','.env.local');
for(const l of fs.readFileSync(envPath,'utf8').split('\n')){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');}
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const ADD=['claude-desktop','chatgpt','perplexity'];
(async()=>{
 const{data,error}=await sb.from('agents').select('id,title,tags,category')
   .not('category','cs','{"Perfect Prompt"}').not('category','cs','{"Companion"}');
 if(error){console.error(error.message);process.exit(1);}
 let changed=0,unchanged=0,fail=0;
 for(const a of data){
   const tags=Array.from(new Set([...(a.tags||[]),...ADD]));
   if(tags.length===(a.tags||[]).length){unchanged++;continue;}
   const{error:e}=await sb.from('agents').update({tags}).eq('id',a.id);
   if(e){fail++;console.log('FAIL',a.title,e.message);}else changed++;
 }
 console.log(`Browse agents: ${data.length} | tagged: ${changed} | already-had: ${unchanged} | fail: ${fail}`);
})();
