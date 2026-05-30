import { NextRequest, NextResponse } from 'next/server';
import { supabaseAnon } from '@/app/lib/supabase-anon';

export async function GET(request: NextRequest) {
  try {
    const { data: agents, error } = await supabaseAnon
      .from('agents')
      .select('category');

    if (error) throw error;

    const categoryMap = new Map<string, number>();
    agents?.forEach((agent) => {
      agent.category?.forEach((cat: string) => {
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
    });

    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
