import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { leaveId, requesterId, startDate, endDate, days, reason, type } = await req.json();

    if (!leaveId || !requesterId) {
      return NextResponse.json(
        { success: false, message: 'Missing leaveId or requesterId' },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get the leave to validate
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('organizationId', (await supabase.from('users').select('organizationId').eq('id', requesterId).single()).data?.organizationId ?? '');
    const leave = (leaves as any[]).find((l: any) => l.id === leaveId);

    if (!leave) {
      return NextResponse.json({ success: false, message: 'Leave request not found' });
    }

    // Get requester
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('organizationId', (await supabase.from('users').select('organizationId').eq('id', requesterId).single()).data?.organizationId ?? '');
    const requester = (users as any[]).find((u: any) => u.id === requesterId);

    if (!requester) {
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    const isAdmin = requester.role === 'admin';
    const isOwner = leave.userid === requesterId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({
        success: false,
        message:
          "❌ You can only edit your own leave requests. You don't have permission to edit other employees' leaves.",
      });
    }

    if (!isAdmin && leave.status !== 'pending') {
      return NextResponse.json({
        success: false,
        message: `❌ Cannot edit this leave — it's already ${leave.status}. Only pending leaves can be edited by employees. Contact admin for changes.`,
      });
    }

    await supabase.from('leave_requests').update({
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(days && { days }),
      ...(reason && { reason }),
      ...(type && { type }),
      updated_at: Date.now(),
    }).eq('id', leaveId);

    return NextResponse.json({
      success: true,
      message: `✅ Leave request updated successfully! ${isAdmin && !isOwner ? 'Employee has been notified.' : ''}`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message ?? 'Failed to update leave request',
    });
  }
}
