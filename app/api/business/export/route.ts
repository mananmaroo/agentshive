import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const DATASETS = new Set(['leads', 'conversations', 'attention']);

function csvCell(value: unknown) {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function csv(rows: Record<string, unknown>[], columns: string[]) {
  return [columns.map(csvCell).join(','), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(','))].join('\r\n');
}

export async function GET(request: NextRequest) {
  const dataset = request.nextUrl.searchParams.get('dataset') || '';
  if (!DATASETS.has(dataset)) return Response.json({ error: 'Choose a valid export.' }, { status: 400 });

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return Response.json({ error: 'Business login required.' }, { status: 401 });

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return Response.json({ error: 'Business login required.' }, { status: 401 });

  const { data: membership, error: membershipError } = await supabase
    .from('business_organization_members')
    .select('organization_id')
    .eq('user_id', userData.user.id)
    .limit(1)
    .maybeSingle();
  if (membershipError || !membership?.organization_id) return Response.json({ error: 'No business workspace is linked.' }, { status: 403 });

  const organizationId = membership.organization_id;
  const { data: organization } = await supabase.from('business_organizations').select('name,status').eq('id', organizationId).single();
  if (!organization || !['pilot', 'active'].includes(organization.status)) return Response.json({ error: 'Workspace access is paused.' }, { status: 403 });

  let rows: Record<string, unknown>[] = [];
  let columns: string[] = [];
  if (dataset === 'leads') {
    const result = await supabase.from('business_leads').select('id,name,email,phone,course_interest,status,created_at,updated_at').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(1000);
    if (result.error) return Response.json({ error: 'Export failed.' }, { status: 500 });
    rows = result.data || [];
    columns = ['id','name','email','phone','course_interest','status','created_at','updated_at'];
  } else if (dataset === 'conversations') {
    const result = await supabase.from('business_conversations').select('id,channel,visitor_name,visitor_email,visitor_phone,status,started_at,last_message_at').eq('organization_id', organizationId).order('last_message_at', { ascending: false }).limit(1000);
    if (result.error) return Response.json({ error: 'Export failed.' }, { status: 500 });
    rows = result.data || [];
    columns = ['id','channel','visitor_name','visitor_email','visitor_phone','status','started_at','last_message_at'];
  } else {
    const result = await supabase.from('business_attention_items').select('id,conversation_id,reason,status,created_at,resolved_at').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(1000);
    if (result.error) return Response.json({ error: 'Export failed.' }, { status: 500 });
    rows = result.data || [];
    columns = ['id','conversation_id','reason','status','created_at','resolved_at'];
  }

  const safeName = String(organization.name || 'business').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'business';
  return new Response('\uFEFF' + csv(rows, columns), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${safeName}-${dataset}.csv"`,
      'cache-control': 'private, no-store',
    },
  });
}
