import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    if (type === 'pending-leaves') {
      const { data: leaves, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('organizationId', organizationId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const mapped = (leaves || []).map((l: any) => ({
        id: l.id,
        userId: l.userid,
        organizationId: l.organizationId,
        startDate: l.start_date,
        endDate: l.end_date,
        status: l.status,
        type: l.type,
        reason: l.reason,
      }));

      return NextResponse.json(mapped);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: any[] = [];
    const { data: eventsData, error } = await supabase
      .from('company_events')
      .select('*')
      .eq('organizationId', organizationId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('[Events API Error]', error);
    } else {
      events.push(...(eventsData || []));
    }

    const mapped = events.map((e: any) => ({
      id: e.id,
      organizationId: e.organizationId,
      name: e.name,
      description: e.description,
      startDate: e.start_date,
      endDate: e.end_date,
      priority: e.priority,
      eventType: e.event_type,
      location: e.location,
      requiredDepartments: e.required_departments,
      creatorId: e.creator_id,
      creatorName: e.creator_name,
      createdAt: e.created_at,
      isAllDay: e.is_all_day,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('[Events API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create': {
        const { name, description, startDate, endDate, priority, eventType, location, requiredDepartments, organizationId, isAllDay } = data;

        if (!organizationId) {
          return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
        }

        const { data: event, error } = await supabase
          .from('company_events')
          .insert({
            organizationId,
            name,
            description,
            start_date: startDate,
            end_date: endDate,
            priority,
            event_type: eventType,
            location,
            required_departments: requiredDepartments,
            creator_id: user.id,
            creator_name: user.email,
            is_all_day: isAllDay ?? false,
            created_at: Date.now(),
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: event });
      }

      case 'update': {
        const { eventId, ...updateData } = data;

        const updatePayload: Record<string, unknown> = {};
        if (updateData.name !== undefined) updatePayload.name = updateData.name;
        if (updateData.description !== undefined) updatePayload.description = updateData.description;
        if (updateData.start_date !== undefined) updatePayload.start_date = updateData.start_date;
        if (updateData.end_date !== undefined) updatePayload.end_date = updateData.end_date;
        if (updateData.priority !== undefined) updatePayload.priority = updateData.priority;
        if (updateData.event_type !== undefined) updatePayload.event_type = updateData.event_type;
        if (updateData.location !== undefined) updatePayload.location = updateData.location;
        if (updateData.required_departments !== undefined) updatePayload.required_departments = updateData.required_departments;
        if (updateData.is_all_day !== undefined) updatePayload.is_all_day = updateData.is_all_day;

        const { data: event, error } = await supabase
          .from('company_events')
          .update(updatePayload as any)
          .eq('id', eventId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: event });
      }

      case 'delete': {
        const { eventId } = data;

        const { error } = await supabase
          .from('company_events')
          .delete()
          .eq('id', eventId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Events API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
