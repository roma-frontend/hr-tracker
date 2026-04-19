import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userid', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (notifications || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type || 'info',
      relatedId: n.related_id,
      metadata: n.metadata,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));

    return NextResponse.json({ notifications: mapped });
  } catch (error) {
    console.error('[notifications GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof isRead === 'boolean') {
      updateData.is_read = isRead;
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notification, success: true });
  } catch (error) {
    console.error('[notifications PATCH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, userId } = body;

    if (action === 'mark-all-as-read') {
      const targetUserId = userId || user.id;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('userid', targetUserId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[notifications POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');

    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
    }

    const { error } = await supabase.from('notifications').delete().eq('id', notificationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[notifications DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
