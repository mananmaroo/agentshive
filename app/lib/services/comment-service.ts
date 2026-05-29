import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface Comment {
  id: string;
  agent_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

export class CommentService {
  static async getComments(agentId: string, limit = 10, offset = 0) {
    const { data, count, error } = await supabase
      .from('comments')
      .select('*, user:user_id(username, avatar_url)', { count: 'exact' })
      .eq('agent_id', agentId)
      .is('deleted_at', null)
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  }

  static async createComment(agentId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ agent_id: agentId, user_id: userId, content }])
      .select('*, user:user_id(username, avatar_url)');

    if (error) throw error;
    return data[0];
  }

  static async updateComment(commentId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select();

    if (error) throw error;
    return data[0];
  }

  static async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId);

    if (error) throw error;
  }

  static async upvoteComment(commentId: string, userId: string) {
    const { data: existing } = await supabase
      .from('comment_upvotes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Remove upvote
      await supabase
        .from('comment_upvotes')
        .delete()
        .eq('id', existing.id);
      return { upvoted: false };
    } else {
      // Add upvote
      await supabase
        .from('comment_upvotes')
        .insert([{ comment_id: commentId, user_id: userId }]);
      return { upvoted: true };
    }
  }

  static async getCommentUpvotes(commentId: string) {
    const { count, error } = await supabase
      .from('comment_upvotes')
      .select('*', { count: 'exact' })
      .eq('comment_id', commentId);

    if (error) throw error;
    return count || 0;
  }
}
