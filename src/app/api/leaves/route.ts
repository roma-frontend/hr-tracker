import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const unreadOnly = searchParams.get('unreadOnly');

    let builder = supabase
      .from('leave_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (requesterId) {
      builder = builder.eq('userid', requesterId);
    }

    if (organizationId) {
      builder = builder.eq('organizationId', organizationId);
    }

    if (status && status !== 'all') {
      builder = builder.eq('status', status as 'pending' | 'approved' | 'rejected');
    }

    if (unreadOnly === 'true') {
      builder = builder.eq('is_read', false).eq('status', 'pending');
    }

    const { data: leaves, error, count } = await builder;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leaves: leaves || [] });
  } catch (error) {
    console.error('[leaves GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const {
      userId,
      organizationId,
      leaveType,
      startDate,
      endDate,
      reason,
      days,
    } = body;

    if (!userId || !organizationId || !leaveType || !startDate || !endDate || days === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: leave, error } = await supabase
      .from('leave_requests')
      .insert({
        userid: userId,
        organizationId: organizationId,
        type: leaveType as 'paid' | 'unpaid' | 'sick' | 'family' | 'doctor',
        start_date: startDate,
        end_date: endDate,
        days: days,
        reason: reason || '',
        status: 'pending',
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leave, success: true });
  } catch (error) {
    console.error('[leaves POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { leaveId, status, reviewedBy, rejectionReason, isRead } = body;

    if (!leaveId) {
      return NextResponse.json(
        { error: 'Leave ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      updateData.reviewed_at = Date.now();
      updateData.reviewed_by = reviewedBy;
    }

    if (rejectionReason) {
      updateData.comment = rejectionReason;
    }

    if (typeof isRead === 'boolean') {
      updateData.is_read = isRead;
    }

    const { data: leave, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', leaveId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leave, success: true });
  } catch (error) {
    console.error('[leaves PATCH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const leaveId = searchParams.get('leaveId');

    if (!leaveId) {
      return NextResponse.json(
        { error: 'Leave ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('leave_requests').delete().eq('id', leaveId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[leaves DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
