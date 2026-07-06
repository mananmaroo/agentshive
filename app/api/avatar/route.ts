import { supabaseAdmin as supabase } from '@/app/lib/supabase-admin';
import { getAuthedUser } from '@/app/lib/auth-helpers';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/avatar - Upload/replace the authed user's avatar.
// Mirrors /api/upload: the storage path is derived from the verified JWT, never
// from form data, so a user can only write their own avatar.
export async function POST(request: NextRequest) {
  try {
    const authedUser = await getAuthedUser(request);
    if (!authedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user_id = authedUser.id;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const maxFileSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: 'Image must be less than 2MB' },
        { status: 400 }
      );
    }
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Avatar must be PNG, JPEG, WEBP, or GIF' },
        { status: 400 }
      );
    }

    const fileExt = (file.name.split('.').pop() || 'png').toLowerCase();
    // Stable path per user so re-uploads overwrite the previous avatar.
    const fileName = `${user_id}/avatar.${fileExt}`;

    const buffer = await file.arrayBuffer();
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    // Cache-bust so the <img> refreshes after an overwrite.
    const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user_id);

    if (updateError) throw updateError;

    return NextResponse.json({ data: { avatar_url: publicUrl } }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
