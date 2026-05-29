import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  category?: string;
  tags?: string[];
  published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  author?: {
    username: string;
    avatar_url?: string;
  };
}

export class BlogService {
  static async getPosts(limit = 12, offset = 0, category?: string) {
    let query = supabase
      .from('blog_posts')
      .select('*, author:author_id(username, avatar_url)', { count: 'exact' })
      .eq('published', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, count, error } = await query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  }

  static async getPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:author_id(username, avatar_url)')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) throw error;

    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id);

    return data;
  }

  static async createPost(postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count'>) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{ ...postData, view_count: 0 }])
      .select();

    if (error) throw error;
    return data[0];
  }

  static async updatePost(id: string, updates: Partial<BlogPost>) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }

  static async getCategories() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('category')
      .eq('published', true)
      .not('category', 'is', null);

    if (error) throw error;

    const categories = new Set<string>();
    data?.forEach((post) => {
      if (post.category) categories.add(post.category);
    });

    return Array.from(categories);
  }

  static async getFeaturedPosts(limit = 3) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:author_id(username, avatar_url)')
      .eq('published', true)
      .not('featured_image_url', 'is', null)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}
