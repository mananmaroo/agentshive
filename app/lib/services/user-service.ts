import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  github_username?: string;
  website_url?: string;
  created_at: string;
}

export class UserService {
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUserProfile(
    userId: string,
    updates: Partial<User>
  ) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data[0];
  }

  static async getUserStats(userId: string) {
    // Get agents created
    const { count: agentsCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .eq('creator_id', userId)
      .is('deleted_at', null);

    // Get total downloads for user's agents
    const { data: agentsData } = await supabase
      .from('agents')
      .select('id, downloads_count')
      .eq('creator_id', userId)
      .is('deleted_at', null);

    const totalDownloads = agentsData?.reduce(
      (sum, agent) => sum + (agent.downloads_count || 0),
      0
    ) || 0;

    // Get ratings received
    const { count: ratingsCount } = await supabase
      .from('ratings')
      .select('*', { count: 'exact' })
      .in('agent_id',
        agentsData?.map(a => a.id) || []
      );

    return {
      agents: agentsCount || 0,
      downloads: totalDownloads,
      ratings: ratingsCount || 0,
    };
  }

  static async createUser(userData: Omit<User, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) throw error;
    return data[0];
  }

  static async usernameExists(username: string) {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('username', username)
      .is('deleted_at', null);

    if (error) throw error;
    return count && count > 0;
  }
}
