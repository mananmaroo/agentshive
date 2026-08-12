'use client';
import Link from 'next/link';
import { useEffect,useState } from 'react';
import { supabaseAnon } from '@/app/lib/supabase-anon';
import { useAuth } from '@/app/lib/auth-context';
type Prospect={id:string;organization_name:string;public_contact_email:string;country:string;score:number;score_reasons:string[];status:string;notes:string};
export default function InternalLeadPilot(){
 const {user}=useAuth(); const [rows,setRows]=useState<Prospect[]>([]); const [message,setMessage]=useState('Loading…');
 useEffect(()=>{(async()=>{if(!user){setMessage('Business login required.');return} const {data,error}=await supabaseAnon.from('business_prospects').select('id,organization_name,public_contact_email,country,score,score_reasons,status,notes').order('score',{ascending:false}); setRows(data||[]);setMessage(error?'Pilot schema is not active in this Preview yet.':'');})()},[user]);
 return <main className="min-h-screen bg-slate-950 p-6 text-white"><div className="mx-auto max-w-6xl">
 <Link href="/employees/dashboard" className="text-emerald-300">← Dashboard</Link>
 <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-amber-300">Internal guided pilot · no sending</p>
 <h1 className="mt-2 text-3xl font-bold">AgentsHive Lead Generation Employee</h1>
 <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">Real when the isolated Preview migration is approved: verified-source storage, deterministic scores, status/notes, approval records, audit trail and CSV-ready data. Planned and disabled: external email delivery, paid AI enrichment and autonomous web research.</div>
 {message&&<p className="mt-6 rounded-lg border border-slate-700 p-4 text-slate-300">{message}</p>}
 <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800"><table className="w-full text-left text-sm"><thead className="bg-slate-900"><tr>{['Organization','Verified public email','Country','Score','Status','Notes'].map(x=><th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(r=><tr className="border-t border-slate-800" key={r.id}><td className="p-3">{r.organization_name}</td><td className="p-3">{r.public_contact_email}</td><td className="p-3">{r.country}</td><td className="p-3">{r.score}</td><td className="p-3">{r.status}</td><td className="p-3">{r.notes}</td></tr>)}</tbody></table></div>
 </div></main>
}