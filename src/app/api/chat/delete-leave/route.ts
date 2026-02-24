import { NextResponse } from 'next/server';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';

export async function POST(req: Request) {
  try {
    const { leaveId, requesterId, employeeName, startDate, endDate, leaveType } = await req.json();

    if (!requesterId) {
      return NextResponse.json({ success: false, message: 'Missing requesterId' }, { status: 400 });
    }

    // Get all leaves
    const leaves = await fetchQuery(api.leaves.getAllLeaves, {});
    const users = await fetchQuery(api.users.getAllUsers, {});

    // Try to find leave by ID first, then by employee name + dates
    let leave = (leaves as any[]).find((l: any) => l._id === leaveId);

    // If not found by ID, search by employee name + dates
    if (!leave && (employeeName || startDate)) {
      leave = (leaves as any[]).find((l: any) => {
        const user = (users as any[]).find((u: any) => u._id === l.userId);
        const nameMatch = employeeName
          ? user?.name?.toLowerCase().includes(employeeName.toLowerCase())
          : true;
        const startMatch = startDate ? l.startDate === startDate : true;
        const endMatch = endDate ? l.endDate === endDate : true;
        const typeMatch = leaveType ? l.type === leaveType : true;
        return nameMatch && startMatch && endMatch && typeMatch;
      });
    }

    if (!leave) {
      // List available leaves for this context to help AI
      const availableLeaves = (leaves as any[]).slice(0, 10).map((l: any) => {
        const user = (users as any[]).find((u: any) => u._id === l.userId);
        return `${user?.name}: ${l.type} ${l.startDate}→${l.endDate} (${l.status}) id:${l._id}`;
      }).join('\n');
      return NextResponse.json({
        success: false,
        message: `Leave request not found. Available leaves:\n${availableLeaves}`
      });
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
