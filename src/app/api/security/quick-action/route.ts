import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Quick Security Action API
 * Allows superadmin to quickly suspend/unsuspend users from notifications
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userId, reason, duration } = await req.json();

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, userId' },
        { status: 400 },
      );
    }

    if (!['suspend', 'unsuspend'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'suspend' or 'unsuspend'" },
        { status: 400 },
      );
    }

    if (action === 'suspend' && !reason) {
      return NextResponse.json({ error: 'Reason is required for suspension' }, { status: 400 });
    }

    const now = Date.now();
    const suspendedUntil = duration ? now + (duration * 60 * 60 * 1000) : null;

    if (action === 'suspend') {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          is_suspended: true,
          suspended_reason: reason,
          suspended_until: suspendedUntil,
          suspended_at: now,
          suspended_by: authUser.id,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `User suspended for ${duration || 24} hours`,
        data: updatedUser,
      });
    } else {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          is_suspended: false,
          suspended_reason: null,
          suspended_until: null,
          suspended_at: null,
          suspended_by: null,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'User unsuspended successfully',
        data: updatedUser,
      });
    }
  } catch (error: any) {
    console.error('[Quick Action API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform action' },
      { status: 500 },
    );
  }
}
