import { supabaseAnon as supabase } from '@/app/lib/supabase-anon';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents/[id]/badge — embeddable SVG badge for READMEs.
//   ?type=installs (default) → "agentshive | 123 installs"
//   ?type=rating             → "agentshive | ★ 4.8"
// Embed:
//   [![Agentshive](https://www.agentshive.net/api/agents/<id>/badge)](https://www.agentshive.net/agents/<id>)

const CHAR_W = 6.3; // approx px per char at 11px Verdana (shields.io heuristic)
const PAD = 10;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function renderBadge(label: string, value: string, valueColor: string): string {
  const lw = Math.round(label.length * CHAR_W + PAD * 2);
  const vw = Math.round(value.length * CHAR_W + PAD * 2);
  const w = lw + vw;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${w}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="20" fill="#1e1b4b"/>
    <rect x="${lw}" width="${vw}" height="20" fill="${valueColor}"/>
    <rect width="${w}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${lw / 2}" y="14.5" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${lw / 2}" y="13.5">${label}</text>
    <text x="${lw + vw / 2}" y="14.5" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${lw + vw / 2}" y="13.5">${value}</text>
  </g>
</svg>`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const type = request.nextUrl.searchParams.get('type') || 'installs';

    const { data: agent, error } = await supabase
      .from('agents')
      .select('downloads_count, average_rating, rating_count')
      .eq('id', id)
      .single();

    const headers = {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // GitHub's camo proxy honors this — counts refresh roughly hourly
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    };

    if (error || !agent) {
      return new NextResponse(renderBadge('agentshive', 'not found', '#9f1239'), {
        status: 404,
        headers,
      });
    }

    const svg =
      type === 'rating'
        ? renderBadge(
            'agentshive',
            agent.rating_count > 0 ? `★ ${Number(agent.average_rating).toFixed(1)}` : 'unrated',
            '#6366f1'
          )
        : renderBadge('agentshive', `${formatCount(agent.downloads_count || 0)} installs`, '#6366f1');

    return new NextResponse(svg, { status: 200, headers });
  } catch (err) {
    console.error('Badge render failed:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
