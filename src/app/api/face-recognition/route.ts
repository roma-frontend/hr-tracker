import { NextResponse } from 'next/server';
import { getAllFaceDescriptors } from '@/lib/supabase/face';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const faceData = await getAllFaceDescriptors();

    const userIds = faceData.map((f) => f.id);
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, organizations(name)')
      .in('id', userIds);

    const descriptors = faceData.map((face) => {
      const user = users?.find((u) => u.id === face.id);
      return {
        userId: face.id,
        name: user?.name || 'Unknown',
        faceDescriptor: face.face_descriptor as number[],
        email: user?.email || '',
      };
    });

    return NextResponse.json(descriptors);
  } catch (error) {
    console.error('[face-recognition/descriptors] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
