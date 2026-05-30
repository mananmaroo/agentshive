import { supabaseAnon as supabase } from '@/app/lib/supabase-anon';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents/[id] - Get single agent details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data: agent }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[id] - Update agent (creator only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Get current user from auth header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify agent exists and user is creator
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Update agent
    const { data: updatedAgent, error: updateError } = await supabase
      .from('agents')
      .update({
        title: body.title,
        description: body.description,
        category: body.category,
        tags: body.tags,
        license: body.license,
        version: body.version,
        homepage_url: body.homepage_url,
        repository_url: body.repository_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ data: updatedAgent }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Delete agent (creator only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: 'Agent deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
