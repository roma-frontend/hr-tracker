import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { action, leaveIds, reviewerId, comment } = await request.json();

    if (!action || !leaveIds || !reviewerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    const approved: string[] = [];
    const errors: string[] = [];

    for (const leaveId of leaveIds) {
      const { error } = await (supabase as any)
        .from('leaves')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
          rejection_reason: action === 'reject' ? comment : null,
        })
        .eq('id', leaveId);

      if (error) {
        errors.push(`Failed to ${action} leave ${leaveId}: ${error.message}`);
      } else {
        approved.push(leaveId);
      }
    }

    return NextResponse.json({
      success: true,
      [action === 'approve' ? 'approved' : 'rejected']: approved,
      errors,
    });
  } catch (error) {
    console.error('[Bulk Actions API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
