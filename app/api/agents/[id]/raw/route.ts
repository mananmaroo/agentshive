import { supabaseAnon as supabase } from '@/app/lib/supabase-anon';
import { supabaseAdmin } from '@/app/lib/supabase-admin';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents/[id]/raw — returns the agent's claude.md content as plain text.
// Designed for Claude Code / Codex to fetch directly:
//   curl https://www.agentshive.net/api/agents/<id>/raw > .claude/agents/foo.md
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, title')
      .eq('id', id)
      .single();

    if (agentError || !agent) {
      return new NextResponse('Agent not found', { status: 404 });
    }

    const { data: file, error: fileError } = await supabase
      .from('agent_files')
      .select('file_content')
      .eq('agent_id', id)
      .eq('file_type', 'claude_md')
      .maybeSingle();

    if (fileError || !file?.file_content) {
      return new NextResponse('No claude.md available for this agent', { status: 404 });
    }

    // Count the install. Must be awaited — work left in flight after the
    // response is killed when the serverless function freezes.
    const { data: countRow } = await supabaseAdmin
      .from('agents')
      .select('downloads_count')
      .eq('id', id)
      .single();
    if (countRow) {
      await supabaseAdmin
        .from('agents')
        .update({ downloads_count: (countRow.downloads_count || 0) + 1 })
        .eq('id', id);
    }

    // text/plain (not text/markdown) and no Content-Disposition, so AI web-fetchers
    // return the body as readable text instead of treating it as a file download.
    return new NextResponse(file.file_content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'Access-Control-Allow-Origin': '*',
        'X-Robots-Tag': 'noindex',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Error fetching raw agent file:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
