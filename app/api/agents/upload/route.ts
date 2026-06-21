import { NextRequest, NextResponse } from 'next/server';
import { supabaseAnon as supabase } from '@/app/lib/supabase-anon';
import { getAuthedUser } from '@/app/lib/auth-helpers';

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
      claude_md_content,
      video_url,
    } = body;

    // Validate required fields
    if (!title || !description || !claude_md_content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, claude_md_content' },
        { status: 400 }
      );
    }

    if (!category || category.length === 0) {
      return NextResponse.json(
        { error: 'At least one category is required' },
        { status: 400 }
      );
    }

    // Create agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        title,
        description,
        category: category || [],
        tags: tags || [],
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

    if (agentError) {
      throw agentError;
    }

    // Store Claude.md as agent file
    const { data: file, error: fileError } = await supabase
      .from('agent_files')
      .insert({
        agent_id: agent.id,
        file_url: `agent-${agent.id}-claude.md`,
        file_type: 'claude_md',
        file_name: 'claude.md',
        file_content: claude_md_content,
      })
      .select()
      .single();

    if (fileError) {
      console.error('File storage error:', fileError);
      // Don't fail if file storage fails - agent was created
    }

    // Add video file if provided
    if (video_url) {
      await supabase.from('agent_files').insert({
        agent_id: agent.id,
        file_url: video_url,
        file_type: 'video_url',
        file_name: 'demo-video',
      });
    }

    return NextResponse.json(
      { data: agent },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload agent' },
      { status: 500 }
    );
  }
}
