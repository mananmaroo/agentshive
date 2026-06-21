import { supabaseAdmin as supabase } from '@/app/lib/supabase-admin';
import { getAuthedUser } from '@/app/lib/auth-helpers';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/upload - Upload agent file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    // Verify the caller's JWT; the storage path is derived from the authed
    // user's id, never from form data.
    const authedUser = await getAuthedUser(request);
    if (!authedUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const user_id = authedUser.id;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/x-python',
      'application/x-python',
      'application/javascript',
      'text/javascript',
      'text/typescript',
    ];

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user_id}/${timestamp}-${randomString}.${fileExt}`;

    // Upload to Supabase Storage
    const buffer = await file.arrayBuffer();
    const { data, error: uploadError } = await supabase.storage
      .from('agents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('agents')
      .getPublicUrl(data.path);

    return NextResponse.json(
      {
        data: {
          path: data.path,
          publicUrl: urlData.publicUrl,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
