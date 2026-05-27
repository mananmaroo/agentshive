import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET /api/agents/[id]/comments - Get all comments for an agent
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get comments with user info
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        user:user_id(id, username, avatar_url)
      `)
      .eq('agent_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (commentsError) {
      throw commentsError;
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', id);

    if (countError) {
      throw countError;
    }

    return NextResponse.json(
      {
        data: comments || [],
        pagination: {
          limit,
          offset,
          total: count || 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/agents/[id]/comments - Add a comment
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { content, user_id } = body;

    // Validate input
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Comment must be 5000 characters or less' },
        { status: 400 }
      );
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        agent_id: id,
        user_id,
        content: content.trim(),
      })
      .select(
        `
        *,
        user:user_id(id, username, avatar_url)
      `
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { data: comment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}
