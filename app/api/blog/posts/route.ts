import { NextRequest, NextResponse } from 'next/server';
import { BlogService } from '@/app/lib/services/blog-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category') || undefined;

    const { data, count } = await BlogService.getPosts(limit, offset, category);

    return NextResponse.json({
      posts: data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint would require authentication
    // For now, it's a placeholder
    const body = await request.json();

    const post = await BlogService.createPost(body);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
