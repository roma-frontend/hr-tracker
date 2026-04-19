import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
    }

    let query = supabase
      .from('driver_schedules')
      .select(`
        *,
        drivers!driver_schedules_driver_id_fkey (
          id,
          name,
          vehicle_info,
          user_id
        ),
        users!driver_schedules_user_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('driverid', organizationId)
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true });

    if (startTime) {
      query = query.gte('start_time', startTime);
    }

    if (endTime) {
      query = query.lte('start_time', endTime);
    }

    const { data: schedules, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enriched = (schedules || []).map((schedule: any) => ({
      id: schedule.id,
      driverId: schedule.driver_id,
      driverName: schedule.drivers?.name || 'Unknown',
      driverVehicle: schedule.drivers?.vehicle_info || null,
      bookedByName: schedule.users?.name || null,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      type: schedule.type || 'trip',
      status: schedule.status,
      tripInfo: schedule.trip_info || null,
      reason: schedule.reason || null,
    }));

    return NextResponse.json({ schedules: enriched });
  } catch (error) {
    console.error('[driver-schedules GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
