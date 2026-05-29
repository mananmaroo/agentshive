import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface Agent {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  category: string[];
  tags: string[];
  average_rating: number;
  rating_count: number;
  downloads_count: number;
  views_count: number;
  verified: boolean;
  featured: boolean;
  created_at: string;
}

export class AgentService {
  static async getAgents(
    limit = 12,
    offset = 0,
    search?: string,
    category?: string,
    sortBy: 'newest' | 'trending' | 'rating' | 'downloads' = 'newest'
  ) {
    let query = supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{"${search}"}`
      );
    }

    if (category) {
      query = query.contains('category', [category]);
    }

    const orderByMap = {
      newest: 'created_at',
      trending: 'views_count',
      rating: 'average_rating',
      downloads: 'downloads_count',
    };

    query = query.order(orderByMap[sortBy], { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return { data, count };
  }

  static async getAgentById(id: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*, creator:creator_id(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  }

  static async createAgent(agentData: Omit<Agent, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('agents')
      .insert([agentData])
      .select();

    if (error) throw error;
    return data[0];
  }

  static async updateAgent(id: string, updates: Partial<Agent>) {
    const { data, error } = await supabase
      .from('agents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }

  static async deleteAgent(id: string) {
    const { error } = await supabase
      .from('agents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async incrementViewCount(agentId: string) {
    const { error } = await supabase.rpc('increment_agent_views', {
      agent_id: agentId,
    });
    if (error) {
      // Fallback if RPC doesn't exist
      const agent = await this.getAgentById(agentId);
      await this.updateAgent(agentId, {
        views_count: (agent.views_count || 0) + 1,
      });
    }
  }

  static async getTopAgents(limit = 10) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .is('deleted_at', null)
      .eq('featured', true)
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async getAgentsByCategory(category: string, limit = 12) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .contains('category', [category])
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async getCategories() {
    const { data, error } = await supabase
      .from('agents')
      .select('category')
      .is('deleted_at', null);

    if (error) throw error;

    const categoryMap = new Map<string, number>();
    data?.forEach((agent) => {
      agent.category?.forEach((cat) => {
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }
}
