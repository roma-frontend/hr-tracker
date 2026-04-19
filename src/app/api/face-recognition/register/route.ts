import { NextResponse } from 'next/server';
import { registerFace } from '@/lib/supabase/face';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, faceDescriptor, faceImageUrl } = body;

    if (!userId || !faceDescriptor || !faceImageUrl) {
      return NextResponse.json(
        { error: 'userId, faceDescriptor, and faceImageUrl are required' },
        { status: 400 }
      );
    }

    await registerFace(userId, faceDescriptor, faceImageUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[face-recognition/register] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
