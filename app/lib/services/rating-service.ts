import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface Rating {
  id: string;
  agent_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export class RatingService {
  static async getRatings(agentId: string) {
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .eq('agent_id', agentId);

    if (ratingsError) throw ratingsError;

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratings?.forEach((r) => {
      ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
    });

    const total = ratings?.length || 0;
    const average =
      total > 0
        ? (ratings?.reduce((sum, r) => sum + r.rating, 0) || 0) / total
        : 0;

    return {
      ratings,
      statistics: {
        average: parseFloat(average.toFixed(2)),
        total,
        distribution: ratingDistribution,
      },
    };
  }

  static async submitRating(
    agentId: string,
    userId: string,
    rating: number
  ) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if user already rated
    const { data: existing } = await supabase
      .from('ratings')
      .select('id')
      .eq('agent_id', agentId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select();

      if (error) throw error;
      return data[0];
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('ratings')
        .insert([{ agent_id: agentId, user_id: userId, rating }])
        .select();

      if (error) throw error;
      return data[0];
    }
  }

  static async deleteRating(agentId: string, userId: string) {
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('agent_id', agentId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async getUserRating(agentId: string, userId: string) {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('agent_id', agentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}
