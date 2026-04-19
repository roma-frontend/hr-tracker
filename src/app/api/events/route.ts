import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const isReviewed = searchParams.get('isReviewed');

    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
    }

    let query = supabase
      .from('leave_conflict_alerts')
      .select(`
        *,
        employee:users!employee_id(name, email, department),
        event:company_events(name, start_date, end_date)
      `)
      .eq('organization_id', organizationId);

    if (isReviewed !== null && isReviewed !== undefined) {
      query = query.eq('is_reviewed', isReviewed === 'true');
    }

    const { data: alerts, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (alerts || []).map((a: any) => ({
      id: a.id,
      employeeId: a.employee_id,
      employeeName: a.employee?.name || 'Unknown',
      employeeEmail: a.employee?.email || '',
      department: a.employee?.department || '',
      eventId: a.event_id,
      eventName: a.event?.name || 'Unknown',
      eventStartDate: a.event?.start_date || '',
      eventEndDate: a.event?.end_date || '',
      leaveStartDate: a.leave_start_date,
      leaveEndDate: a.leave_end_date,
      leaveType: a.leave_type,
      conflictType: a.conflict_type,
      severity: a.severity,
      isReviewed: a.is_reviewed,
      reviewNotes: a.review_notes,
      createdAt: a.created_at,
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error('[Events API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
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
    const { action, alertId, adminId, isApproved, reviewNotes } = body;

    if (action === 'review-conflict-alert') {
      if (!alertId || !adminId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const { data: alert, error } = await supabase
        .from('leave_conflict_alerts')
        .update({
          is_reviewed: true,
          reviewed_by: adminId,
          reviewed_at: Date.now(),
          review_notes: reviewNotes || (isApproved ? 'Approved despite conflict' : 'Flagged for discussion'),
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: alert, success: true });
    }

    if (action === 'create-company-event') {
      const { organizationId, userId, name, description, startDate, endDate, isAllDay, eventType, priority, requiredDepartments, notifyDaysBefore } = body;

      if (!organizationId || !userId || !name || !startDate || !endDate || !eventType || !requiredDepartments || requiredDepartments.length === 0) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const { data: event, error } = await supabase
        .from('company_events')
        .insert({
          organizationId,
          name,
          description: description || '',
          start_date: new Date(startDate).getTime(),
          end_date: new Date(endDate).getTime(),
          is_all_day: isAllDay ?? true,
          event_type: eventType,
          priority: priority || 'medium',
          required_departments: requiredDepartments,
          creator_id: userId,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: event, success: true });
    }

    if (action === 'check-leave-conflicts-manual') {
      const { leaveRequestId, userId, startDate, endDate, organizationId } = body;

      if (!leaveRequestId || !userId || !startDate || !endDate || !organizationId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const { data: conflicts, error } = await supabase
        .from('leave_conflict_alerts')
        .select('*')
        .eq('leave_request_id', leaveRequestId)
        .eq('organization_id', organizationId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ conflictsFound: conflicts?.length || 0, conflicts: conflicts || [], success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Events API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
