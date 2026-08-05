import { NextRequest, NextResponse } from 'next/server';
import { BlogService } from '@/app/lib/services/blog-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLimit = Number.parseInt(searchParams.get('limit') || '12', 10);
    const rawOffset = Number.parseInt(searchParams.get('offset') || '0', 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 12;
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;
    const category = searchParams.get('category') || undefined;

    const { data, count } = await BlogService.getPosts(limit, offset, category);

    return NextResponse.json({
      posts: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST() {
  // Publishing requires a separately reviewed admin workflow. Never expose
  // service-role writes through this public route.
  return NextResponse.json(
    { error: 'Blog publishing is not available through this endpoint' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}
