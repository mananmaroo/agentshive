import { supabaseAdmin as supabase } from '@/app/lib/supabase-admin';
import { getAuthedUser } from '@/app/lib/auth-helpers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's agents count
    const { count: agentCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', id);

    // Get total downloads of user's agents
    const { data: userAgents } = await supabase
      .from('agents')
      .select('downloads_count')
      .eq('creator_id', id);

    const totalDownloads = userAgents
      ? userAgents.reduce((sum, a) => sum + (a.downloads_count || 0), 0)
      : 0;

    return NextResponse.json(
      {
        data: {
          ...user,
          stats: {
            agents: agentCount || 0,
            totalDownloads,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user profile
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Verify the caller's JWT
    const authedUser = await getAuthedUser(request);
    if (!authedUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Enforce ownership: a user may only update their own profile
    if (authedUser.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    // Only these fields may be updated; identity/email/timestamps are never
    // taken from the request body.
    const {
      username,
      bio,
      avatar_url,
      github_username,
      website_url,
      linkedin_url,
      experience_level,
      primary_interest,
      badges_acknowledged,
    } = body;
    // NOTE: `badges` is deliberately NOT read from the body — a user must never
    // be able to grant themselves a badge. Badges are only set via admin SQL.

    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const validInterests = ['building', 'browsing', 'learning', 'sharing'];
    if (experience_level && !validLevels.includes(experience_level)) {
      return NextResponse.json({ error: 'Invalid experience level' }, { status: 400 });
    }
    if (primary_interest && !validInterests.includes(primary_interest)) {
      return NextResponse.json({ error: 'Invalid interest' }, { status: 400 });
    }

    // Validate username if changed
    if (username) {
      if (username.length < 3 || username.length > 30) {
        return NextResponse.json(
          { error: 'Username must be 3-30 characters' },
          { status: 400 }
        );
      }

      // Check if username is available
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    // Update user
    // Allowlist of updatable fields. Never allow id/email/timestamps to be
    // overwritten from the request body.
    const updateData: any = {};
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio || null;
    if (avatar_url) updateData.avatar_url = avatar_url;
    if (github_username) updateData.github_username = github_username;
    if (website_url !== undefined) updateData.website_url = website_url || null;
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url || null;
    if (experience_level) updateData.experience_level = experience_level;
    if (primary_interest) updateData.primary_interest = primary_interest;
    // Stamp first-time onboarding once the user answers the questions.
    if (experience_level || primary_interest) {
      updateData.onboarded_at = new Date().toISOString();
    }
    // A user may only acknowledge badges they actually hold — clamp the input
    // to their real badges so this can't be abused to write arbitrary values.
    if (Array.isArray(badges_acknowledged)) {
      const { data: current } = await supabase
        .from('users')
        .select('badges')
        .eq('id', id)
        .single();
      const owned: string[] = current?.badges || [];
      updateData.badges_acknowledged = badges_acknowledged.filter(
        (b: unknown) => typeof b === 'string' && owned.includes(b)
      );
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { data: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
