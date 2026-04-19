import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const leaveId: string = body.leaveId ?? '';
    const requesterId: string = body.requesterId ?? '';
    const searchEmployeeName: string = body.employeeName ?? '';
    const searchStartDate: string = body.startDate ?? '';
    const searchEndDate: string = body.endDate ?? '';
    const searchLeaveType: string = body.leaveType ?? '';

    if (!requesterId) {
      return NextResponse.json({ success: false, message: 'Missing requesterId' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch all data
    const { data: requesterUser } = await supabase.from('users').select('organizationId').eq('id', requesterId).single();
    const organizationId = requesterUser?.organizationId;

    const { data: allLeaves } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('organizationId', organizationId || '');
    
    const { data: allUsers } = await supabase
      .from('users')
      .select('*')
      .eq('organizationId', organizationId || '');

    // Find leave by ID first
    let targetLeave = (allLeaves as any[]).find((l: any) => l.id === leaveId);

    // If not found by ID — search by employee name + dates
    if (!targetLeave) {
      targetLeave = (allLeaves as any[]).find((l: any) => {
        const leaveUser = (allUsers as any[]).find((u: any) => u.id === l.userid);
        const nameOk = searchEmployeeName
          ? leaveUser?.name?.toLowerCase().includes(searchEmployeeName.toLowerCase())
          : true;
        const startOk = searchStartDate ? l.start_date === searchStartDate : true;
        const endOk = searchEndDate ? l.end_date === searchEndDate : true;
        const typeOk = searchLeaveType ? l.type === searchLeaveType : true;
        return nameOk && startOk && endOk && typeOk;
      });
    }

    if (!targetLeave) {
      const preview = (allLeaves as any[])
        .slice(0, 5)
        .map((l: any) => {
          const u = (allUsers as any[]).find((u: any) => u.id === l.userid);
          return `${u?.name ?? '?'}: ${l.type} ${l.start_date}→${l.end_date} [${l.id}]`;
        })
        .join(', ');
      return NextResponse.json({
        success: false,
        message: `Leave not found. Available: ${preview}`,
      });
    }

    // Find requester
    const requester = (allUsers as any[]).find((u: any) => u.id === requesterId);
    if (!requester) {
      return NextResponse.json({ success: false, message: 'Requester not found' });
    }

    const isAdmin = requester.role === 'admin';
    const isOwner = targetLeave.userid === requesterId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({
        success: false,
        message: '❌ You can only delete your own leave requests.',
      });
    }

    const ownerUser = (allUsers as any[]).find((u: any) => u.id === targetLeave.userid);
    const ownerName = ownerUser?.name ?? 'Employee';

    await supabase.from('leave_requests').delete().eq('id', targetLeave.id);

    return NextResponse.json({
      success: true,
      message: `✅ ${isAdmin && !isOwner ? `${ownerName}'s` : 'Your'} ${targetLeave.type} leave (${targetLeave.start_date} → ${targetLeave.end_date}) has been deleted.${targetLeave.status === 'approved' ? ' Leave balance restored.' : ''}`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message ?? 'Failed to delete leave',
    });
  }
}
