import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/app/lib/services/agent-service';

export async function GET(request: NextRequest) {
  try {
    const categories = await AgentService.getCategories();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
