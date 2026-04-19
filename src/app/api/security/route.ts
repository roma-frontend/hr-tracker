import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'get-face-descriptor': {
        const userId = searchParams.get('userId');

        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('users')
          .select('face_descriptor, face_image_url, face_registered_at')
          .eq('id', userId)
          .single();

        if (error || !data) {
          return NextResponse.json({ data: null });
        }

        return NextResponse.json({
          data: {
            faceDescriptor: data.face_descriptor,
            faceImageUrl: data.face_image_url,
            faceRegisteredAt: data.face_registered_at,
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    switch (action) {
      case 'remove-face-registration': {
        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { error } = await supabase
          .from('users')
          .update({
            face_descriptor: null,
            face_image_url: null,
            face_registered_at: null,
          })
          .eq('id', userId);

        if (error) {
          throw error;
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
