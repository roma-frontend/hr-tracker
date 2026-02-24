import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { userId, type, startDate, endDate, days, reason } = await req.json();

    if (!userId || !type || !startDate || !endDate || !days || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for conflicts — see if user already has approved/pending leave in this period
    const userLeaves = await convex.query(api.leaves.getUserLeaves, { userId });
    const conflict = userLeaves.find((leave: any) => {
      if (leave.status === 'rejected') return false;
      const existStart = new Date(leave.startDate);
      const existEnd = new Date(leave.endDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      return newStart <= existEnd && newEnd >= existStart;
    });

    if (conflict) {
      // Suggest next available dates after the conflict ends
      const conflictEnd = new Date(conflict.endDate);
      conflictEnd.setDate(conflictEnd.getDate() + 1);
      const suggestedStart = conflictEnd.toISOString().split('T')[0];
      const suggestedEnd = new Date(conflictEnd);
      suggestedEnd.setDate(suggestedEnd.getDate() + days - 1);
      const suggestedEndStr = suggestedEnd.toISOString().split('T')[0];

      return NextResponse.json({
        success: false,
        conflict: true,
        message: `You already have a ${conflict.type} leave (${conflict.startDate} → ${conflict.endDate}) with status: "${conflict.status}". 💡 Suggested alternative: ${suggestedStart} → ${suggestedEndStr}`,
      });
    }

    // Check leave balance
    const user = await convex.query(api.users.getUserById, { userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'paid' && (user.paidLeaveBalance ?? 0) < days) {
      return NextResponse.json({
        success: false,
        conflict: true,
        message: `You don't have enough paid leave balance. Available: ${user.paidLeaveBalance ?? 0} days, requested: ${days} days.`,
      });
    }
    if (type === 'sick' && (user.sickLeaveBalance ?? 0) < days) {
      return NextResponse.json({
        success: false,
        conflict: true,
        message: `You don't have enough sick leave balance. Available: ${user.sickLeaveBalance ?? 0} days, requested: ${days} days.`,
      });
    }
    if (type === 'family' && (user.familyLeaveBalance ?? 0) < days) {
      return NextResponse.json({
        success: false,
        conflict: true,
        message: `You don't have enough family leave balance. Available: ${user.familyLeaveBalance ?? 0} days, requested: ${days} days.`,
      });
    }

    // Create the leave request — status will be "pending" (admin must approve)
    const leaveId = await convex.mutation(api.leaves.createLeave, {
      userId,
      type,
      startDate,
      endDate,
      days,
      reason,
      comment: 'Submitted via AI Assistant',
    });

    return NextResponse.json({
      success: true,
      leaveId,
      message: `✅ Your ${type} leave request for ${days} day(s) (${startDate} → ${endDate}) has been submitted and sent to admin for approval!`,
    });
  } catch (error) {
    console.error('Book leave error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create leave request' },
      { status: 500 }
    );
  }
}
