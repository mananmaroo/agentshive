import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// DELETE /api/agents/[id]/comments/[commentId] - Delete a comment (comment creator only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await context.params;

    // Get the comment to verify ownership
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Delete the comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: 'Comment deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[id]/comments/[commentId] - Update comment (creator only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await context.params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Comment must be 5000 characters or less' },
        { status: 400 }
      );
    }

    // Update the comment
    const { data: updatedComment, error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select(
        `
        *,
        user:user_id(id, username, avatar_url)
      `
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { data: updatedComment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update comment' },
      { status: 500 }
    );
  }
}
