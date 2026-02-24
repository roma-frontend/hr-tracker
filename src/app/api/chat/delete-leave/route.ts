import { NextResponse } from 'next/server';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';

export async function POST(req: Request) {
  try {
    const { leaveId, requesterId } = await req.json();

    if (!leaveId || !requesterId) {
      return NextResponse.json({ success: false, message: 'Missing leaveId or requesterId' }, { status: 400 });
    }

    // Get the leave to show details in response
    const leaves = await fetchQuery(api.leaves.getAllLeaves, {});
    const leave = (leaves as any[]).find((l: any) => l._id === leaveId);

    if (!leave) {
      return NextResponse.json({ success: false, message: 'Leave request not found' });
    }

    // Get requester
    const users = await fetchQuery(api.users.getAllUsers, {});
    const requester = (users as any[]).find((u: any) => u._id === requesterId);

    if (!requester) {
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    const isAdmin = requester.role === 'admin';
    const isOwner = leave.userId === requesterId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({
        success: false,
        message: "❌ You can only delete your own leave requests. You don't have permission to delete other employees' leaves."
      });
    }

    const employeeName = leave.userName ?? 'Employee';
    await fetchMutation(api.leaves.deleteLeave, {
      leaveId: leaveId as Id<'leaveRequests'>,
      requesterId: requesterId as Id<'users'>,
    });

    return NextResponse.json({
      success: true,
      message: `✅ ${isAdmin && !isOwner ? `${employeeName}'s` : 'Your'} ${leave.type} leave (${leave.startDate} → ${leave.endDate}) has been deleted.${leave.status === 'approved' ? ' Leave balance has been restored.' : ''}`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message ?? 'Failed to delete leave request',
    });
  }
}
