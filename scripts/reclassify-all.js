const fs=require('fs'),path=require('path');const{createClient}=require('@supabase/supabase-js');
const envPath=path.join(__dirname,'..','.env.local');
for(const l of fs.readFileSync(envPath,'utf8').split('\n')){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');}
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

// The only entries that must reach outside the chat -> stay Agents (in Browse).
const KEEP_AS_AGENT=new Set([
 'AI Job Application Automation','Beta API Response Validator','Beta Data Analysis Agent',
 'Beta Email Classifier & Triage','Beta Market Research Assistant','Beta Social Media Content Planner',
 'Calendar Scheduling Assistant','Competitor Analysis Agent','Customer Feedback Distributor',
 'Daily Standup Reporter','Due Diligence Researcher','Email Inbox Zero Assistant','File Organizer Agent',
 'Grant Finder','Market Research Analyst','Newsletter Curator','Patent Prior-Art Searcher',
 'Support Ticket Triage Agent','Trend Scout','YouTube Video Summarizer',
]);

(async()=>{
 const{data,error}=await sb.from('agents').select('id,title,category');
 if(error){console.error(error.message);process.exit(1);}
 let toPP=0,keep=0,unchanged=0,changed=0,fail=0;
 for(const a of data){
   const isAgent=KEEP_AS_AGENT.has(a.title);
   const orig=(a.category||[]).filter(c=>c!=='Perfect Prompt');
   if(isAgent){keep++; if((a.category||[]).includes('Perfect Prompt')){
       // safety: remove stray PP from an agent
       const {error:e2}=await sb.from('agents').update({category:orig}).eq('id',a.id);
       if(e2){fail++;console.log('FAIL',a.title,e2.message);}else changed++;
     } continue;}
   toPP++;
   const want=['Perfect Prompt',...orig];
   const same=JSON.stringify(want)===JSON.stringify(a.category||[]);
   if(same){unchanged++;continue;}
   const{error:e}=await sb.from('agents').update({category:want}).eq('id',a.id);
   if(e){fail++;console.log('FAIL',a.title,e.message);}else changed++;
 }
 console.log(`Perfect-Prompt targets: ${toPP} | kept-as-Agent: ${keep}`);
 console.log(`Rows changed: ${changed} | already-correct: ${unchanged} | failures: ${fail}`);
})();
