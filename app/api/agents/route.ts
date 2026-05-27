import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

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
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      tags,
      claude_md_file,
      repository_url,
      homepage_url,
      license,
      version,
      creator_id,
    } = body;

    // Validate required fields
    if (!title || !description || !creator_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, creator_id' },
        { status: 400 }
      );
    }

    // Insert agent
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        title,
        description,
        category: category || [],
        tags: tags || [],
        claude_md_file: claude_md_file || null,
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

    return NextResponse.json(
      { data: agent },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    );
  }
}
