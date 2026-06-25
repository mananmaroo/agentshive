const fs=require('fs'),path=require('path');const{createClient}=require('@supabase/supabase-js');
const envPath=path.join(__dirname,'..','.env.local');
for(const l of fs.readFileSync(envPath,'utf8').split('\n')){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');}
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

const NEW=[
 {title:'GitHub Issue Triage Agent',description:'Watches your repository for new issues, then reads each one, applies the right labels, assigns it to the best owner, links duplicates, and posts a short triage summary — so your backlog stays sorted automatically.',category:['Automation','Code Generation'],tags:['github','triage','automation','issues','mcp']},
 {title:'SEO Site Auditor Agent',description:'Crawls your website page by page, checks titles, meta tags, headings, broken links, image alt text, and page speed, then writes a prioritized fix list with the exact pages and lines to change.',category:['Research','Automation'],tags:['seo','web-crawl','audit','playwright','automation']},
 {title:'Price Drop Tracker Agent',description:'Monitors product pages on a schedule, records the price each run, and alerts you the moment something drops below your target — with a history chart and the direct buy link.',category:['Automation','Data Analysis'],tags:['web','monitoring','price-tracking','alerts','automation']},
 {title:'Cloud Cost Watchdog Agent',description:'Pulls your cloud billing data through the provider API, compares spend against last week, flags unexpected spikes by service, and posts a plain-language cost report to Slack.',category:['Data Analysis','Automation'],tags:['cloud','cost','billing','slack','monitoring']},
 {title:'Uptime & Incident Reporter Agent',description:'Pings your endpoints on an interval, detects outages and slow responses, opens an incident note with timestamps, and posts status updates until the service recovers.',category:['Automation'],tags:['monitoring','uptime','incidents','http','alerts']},
 {title:'Lead Enrichment Agent',description:'Takes a list of company or contact names and enriches each row with website, industry, size, and public contact details gathered from the web — writing a clean, deduplicated CSV.',category:['Research','Data Analysis'],tags:['leads','enrichment','web','crm','automation']},
 {title:'RSS-to-Newsletter Agent',description:'Follows your chosen RSS and news feeds, reads every new article, clusters them by topic, drafts a summarized issue, and sends it to your mailing list on confirmation.',category:['Content Creation','Automation'],tags:['rss','newsletter','email','curation','automation']},
 {title:'Jira Sprint Reporter Agent',description:'Connects to Jira, reads the active sprint, computes completed vs remaining points and blockers, and posts a clear sprint health summary to your team channel each morning.',category:['Automation','Data Analysis'],tags:['jira','sprint','reporting','slack','agile']},
 {title:'Customer Review Responder Agent',description:'Pulls new reviews from your app store or marketplace listing, drafts an on-brand reply for each, flags angry ones for a human, and posts the approved responses.',category:['Customer Support','Automation'],tags:['reviews','customer-support','automation','api','replies']},
 {title:'Calendar Conflict Resolver Agent',description:'Scans your calendar for double-bookings and back-to-back overload, proposes the least-disruptive reshuffle across time zones, and updates the invites once you approve.',category:['Automation'],tags:['calendar','scheduling','automation','google-calendar','productivity']},
 {title:'Web Form Auto-Filler Agent',description:'Opens a target web form in a real browser, fills it from your structured data, handles multi-step flows and validation errors, and captures a screenshot receipt of each submission.',category:['Automation'],tags:['web','playwright','forms','automation','rpa']},
 {title:'Database Health & Backup Agent',description:'Runs scheduled backups, verifies they restore, checks slow queries and table bloat, and emails a short health report with anything that needs attention.',category:['Automation','Data Analysis'],tags:['database','backup','monitoring','sql','ops']},
 {title:'Social Media Auto-Poster Agent',description:'Takes your approved content calendar and publishes each post to the right platform at the scheduled time, then collects early engagement numbers into a tracking sheet.',category:['Content Creation','Automation'],tags:['social-media','scheduling','posting','api','automation']},
 {title:'Slack Channel Digest Agent',description:'Reads the busy channels you pick, summarizes decisions, questions, and action items from the day, and posts a tidy digest so nobody has to scroll back.',category:['Automation','Customer Support'],tags:['slack','digest','summary','automation','productivity']},
];

(async()=>{
 const{data:team}=await sb.from('users').select('id').eq('username','agentshive_team').maybeSingle();
 const creator_id=team?.id; if(!creator_id){console.error('no team user');process.exit(1);}
 let created=0,skipped=0;
 for(const a of NEW){
   const{data:exists}=await sb.from('agents').select('id').eq('title',a.title).maybeSingle();
   if(exists){skipped++;console.log('skip (exists):',a.title);continue;}
   const{error}=await sb.from('agents').insert({
     ...a,creator_id,downloads_count:0,views_count:0,average_rating:0,rating_count:0,
     verified:true,featured:false,
   });
   if(error){console.log('FAIL',a.title,error.message);}else{created++;console.log('created:',a.title);}
 }
 console.log(`\nCreated ${created}, skipped ${skipped}.`);
 const{count}=await sb.from('agents').select('*',{count:'exact',head:true})
   .not('category','cs','{"Perfect Prompt"}').not('category','cs','{"Companion"}');
 console.log('Browse now shows',count,'agents.');
})();
