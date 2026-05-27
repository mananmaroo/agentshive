import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET /api/agents/[id]/ratings - Get all ratings for an agent
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('agent_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate statistics
    const stats = {
      total: ratings?.length || 0,
      average: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    if (ratings && ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      stats.average = sum / ratings.length;

      ratings.forEach((r) => {
        stats.distribution[r.rating as keyof typeof stats.distribution]++;
      });
    }

    return NextResponse.json(
      {
        data: ratings || [],
        statistics: stats,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

// POST /api/agents/[id]/ratings - Submit or update a rating
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { rating, user_id } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Check if user already rated this agent
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('agent_id', id)
      .eq('user_id', user_id)
      .single();

    let result;

    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating })
        .eq('agent_id', id)
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new rating
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          agent_id: id,
          user_id,
          rating,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Recalculate average rating for the agent
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('agent_id', id);

    if (allRatings && allRatings.length > 0) {
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

      await supabase
        .from('agents')
        .update({
          average_rating: avgRating,
          rating_count: allRatings.length,
        })
        .eq('id', id);
    }

    return NextResponse.json(
      { data: result },
      { status: existingRating ? 200 : 201 }
    );
  } catch (error: any) {
    console.error('Error creating/updating rating:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id]/ratings - Delete a rating
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('agent_id', id)
      .eq('user_id', user_id);

    if (error) {
      throw error;
    }

    // Recalculate average rating
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('agent_id', id);

    if (allRatings && allRatings.length > 0) {
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      await supabase
        .from('agents')
        .update({
          average_rating: avgRating,
          rating_count: allRatings.length,
        })
        .eq('id', id);
    } else {
      // No more ratings
      await supabase
        .from('agents')
        .update({
          average_rating: 0,
          rating_count: 0,
        })
        .eq('id', id);
    }

    return NextResponse.json(
      { message: 'Rating deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting rating:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete rating' },
      { status: 500 }
    );
  }
}
