import { supabaseAnon as supabase } from '@/app/lib/supabase-anon';
import { supabaseAdmin } from '@/app/lib/supabase-admin';
import { getAuthedUser } from '@/app/lib/auth-helpers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents - List all agents with filtering, sorting, pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'trending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    let query = supabase.from('agents').select('*');

    // Apply search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{"${search}"}`
      );
    }

    // Apply category filter
    if (category) {
      query = query.contains('category', [category]);
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'rating':
        query = query.order('average_rating', { ascending: false });
        break;
      case 'downloads':
        query = query.order('downloads_count', { ascending: false });
        break;
      case 'trending':
      default:
        query = query.order('downloads_count', { ascending: false });
        break;
    }

    // Get total count before pagination
    const { count } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: agents, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        data: agents || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create new agent
export async function POST(request: NextRequest) {
  try {
    // Verify the caller's JWT; the agent's creator is always the authed user.
    const authedUser = await getAuthedUser(request);
    if (!authedUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const creator_id = authedUser.id;

    const body = await request.json();
    const {
      title,
      description,
      category,
      tags,
      repository_url,
      homepage_url,
      license,
      version,
      file, // { type: 'claude_md' | 'video_url', name, content, url }
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description' },
        { status: 400 }
      );
    }
    if (!file || (file.type === 'video_url' ? !file.url : !file.content)) {
      return NextResponse.json(
        { error: 'Provide file content (or a video URL).' },
        { status: 400 }
      );
    }

    // Use the service-role client so the insert isn't blocked by RLS. Identity
    // is already verified via the JWT above; creator_id is the authed user.
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .insert({
        title,
        description,
        category: category || [],
        tags: tags || [],
        repository_url: repository_url || null,
        homepage_url: homepage_url || null,
        license: license || 'MIT',
        version: version || '1.0.0',
        creator_id,
        downloads_count: 0,
        views_count: 0,
        average_rating: 0,
        rating_count: 0,
        verified: false,
        featured: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Store the agent's file (claude.md content or a video URL).
    const fileRow =
      file.type === 'video_url'
        ? {
            agent_id: agent.id,
            file_url: file.url,
            file_type: 'video_url',
            file_name: 'demo-video',
          }
        : {
            agent_id: agent.id,
            file_url: `agent-${agent.id}-claude.md`,
            file_type: 'claude_md',
            file_name: file.name || 'claude.md',
            file_content: file.content,
          };

    const { error: fileError } = await supabaseAdmin.from('agent_files').insert(fileRow);
    if (fileError) {
      // Roll back the agent so we don't leave a fileless orphan.
      await supabaseAdmin.from('agents').delete().eq('id', agent.id);
      throw fileError;
    }

    return NextResponse.json({ data: agent }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    );
  }
}
