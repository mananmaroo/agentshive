import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface AgentRequest {
  id: string;
  user_id?: string;
  requester_email: string;
  requester_name: string;
  agent_description: string;
  use_case: string;
  budget?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class AgentRequestService {
  static async submitRequest(requestData: Omit<AgentRequest, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data, error } = await supabase
      .from('agent_requests')
      .insert([{ ...requestData, status: 'pending' }])
      .select();

    if (error) throw error;
    return data[0];
  }

  static async getRequests(limit = 20, offset = 0) {
    const { data, count, error } = await supabase
      .from('agent_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  }

  static async getRequestById(id: string) {
    const { data, error } = await supabase
      .from('agent_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateRequest(id: string, updates: Partial<AgentRequest>) {
    const { data, error } = await supabase
      .from('agent_requests')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }

  static async getRequestsByBudget(minBudget: number, maxBudget: number) {
    const { data, error } = await supabase
      .from('agent_requests')
      .select('*')
      .gte('budget', minBudget)
      .lte('budget', maxBudget)
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  }
}
