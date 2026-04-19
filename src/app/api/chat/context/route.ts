import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Opt out of static generation — uses cookies
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('hr-session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get user session
    const { data: session } = await supabase
      .from('users')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get user data
    const userId = session.id;

    // Fetch user's leave data
    const { data: userLeaves } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('userid', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate analytics manually
    const approvedLeaves = userLeaves?.filter((l: any) => l.status === 'approved') || [];
    const pendingLeaves = userLeaves?.filter((l: any) => l.status === 'pending') || [];
    const totalDaysTaken = approvedLeaves.reduce((sum: number, l: any) => sum + (l.days || 0), 0);
    const pendingDays = pendingLeaves.reduce((sum: number, l: any) => sum + (l.days || 0), 0);

    // Get team calendar
    const { data: teamCalendar } = await supabase
      .from('leave_requests')
      .select('*, users(name, department)')
      .eq('organizationId', session.organizationId!)
      .eq('status', 'approved')
      .gte('start_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(20);

    // Build context for AI
    const context = {
      user: {
        id: userId,
        name: session.name,
        email: session.email,
        role: session.role,
        department: session.department,
        organizationId: session.organizationId,
      },
      leaveBalances: {
        paid: session.paid_leave_balance || 0,
        sick: session.sick_leave_balance || 0,
        family: session.family_leave_balance || 0,
      },
      stats: {
        totalDaysTaken,
        pendingDays,
      },
      recentLeaves:
        userLeaves?.slice(0, 5).map((l: any) => ({
          type: l.type,
          startDate: l.start_date,
          endDate: l.end_date,
          status: l.status,
          days: l.days,
        })) || [],
      teamAvailability:
        teamCalendar?.slice(0, 10).map((l: any) => ({
          userName: l.users?.name || 'Unknown',
          department: l.users?.department || '',
          startDate: l.start_date,
          endDate: l.end_date,
        })) || [],
    };

    return NextResponse.json(context);
  } catch (error) {
    console.error('Context error:', error);
    return NextResponse.json({ error: 'Failed to get context' }, { status: 500 });
  }
}
