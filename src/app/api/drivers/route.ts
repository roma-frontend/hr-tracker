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

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (type === 'available-drivers') {
      const organizationId = searchParams.get('organizationId');
      const date = searchParams.get('date');

      if (!organizationId) {
        return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
      }

      const query = supabase
        .from('drivers')
        .select('*')
        .eq('organizationId', organizationId)
        .eq('is_available', true);

      const { data: drivers } = await query;

      const enriched = (drivers || []).map((driver: any) => ({
        ...driver,
        id: driver.id,
        organizationId: driver.organizationId,
        userId: driver.userid,
        vehicleModel: driver.vehicle_model,
        vehiclePlateNumber: driver.vehicle_plate_number,
        vehicleCapacity: driver.vehicle_capacity,
        vehicleColor: driver.vehicle_color,
        vehicleYear: driver.vehicle_year,
        isAvailable: driver.is_available,
        isOnShift: driver.is_on_shift,
      }));

      return NextResponse.json(enriched);
    }

    if (type === 'driver-schedules') {
      const driverId = searchParams.get('driverId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!driverId) {
        return NextResponse.json({ error: 'driverId required' }, { status: 400 });
      }

      let query = (supabase as any)
        .from('driver_schedules')
        .select('*')
        .eq('driver_id', driverId)
        .order('start_time', { ascending: true });

      if (startDate) {
        query = query.gte('start_time', startDate);
      }
      if (endDate) {
        query = query.lte('start_time', endDate);
      }

      const { data: schedules } = await query;

      const mapped = (schedules || []).map((s: any) => ({
        ...s,
        id: s.id,
        driverId: s.driver_id,
        startTime: s.start_time,
        endTime: s.end_time,
        tripInfo: s.trip_info,
      }));

      return NextResponse.json(mapped);
    }

    if (type === 'driver-requests') {
      const organizationId = searchParams.get('organizationId');
      const status = searchParams.get('status');

      if (!organizationId) {
        return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
      }

      let query = (supabase as any)
        .from('driver_requests')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: requests } = await query;

      const mapped = (requests || []).map((r: any) => ({
        ...r,
        id: r.id,
        organizationId: r.organization_id,
        startTime: r.start_time,
        endTime: r.end_time,
        tripInfo: r.trip_info,
        assignedDriver: r.driver ? { userName: r.driver.name } : null,
      }));

      return NextResponse.json(mapped);
    }

    if (type === 'recurring-trips') {
      const organizationId = searchParams.get('organizationId');

      if (!organizationId) {
        return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
      }

      const { data: trips } = await (supabase as any)
        .from('recurring_trips')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      const mapped = (trips || []).map((t: any) => ({
        ...t,
        id: t.id,
        organizationId: t.organization_id,
        userId: t.user_id,
        driverId: t.driver_id,
        isActive: t.is_active,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        driverName: t.driver_name,
        tripInfo: t.trip_info,
        schedule: t.schedule,
      }));

      return NextResponse.json(mapped);
    }

    if (type === 'driver-shifts') {
      const organizationId = searchParams.get('organizationId');
      const driverId = searchParams.get('driverId');

      let query = (supabase as any).from('driver_shifts').select('*').order('created_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }
      if (driverId) {
        query = query.eq('driver_id', driverId);
      }

      const { data: shifts } = await query;

      const mapped = (shifts || []).map((s: any) => ({
        ...s,
        id: s.id,
        organizationId: s.organization_id,
        driverId: s.driver_id,
        startTime: s.start_time,
        endTime: s.end_time,
        createdAt: s.created_at,
      }));

      return NextResponse.json(mapped);
    }

    if (type === 'driver-favorites') {
      const userId = searchParams.get('userId');

      if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 });
      }

      const { data: favorites } = await (supabase as any)
        .from('passenger_favorites')
        .select('*')
        .eq('passenger_id', userId);

      const mapped = (favorites || []).map((f: any) => ({
        ...f,
        id: f.id,
        passengerId: f.passenger_id,
        driverId: f.driver_id,
        driver: f.drivers
          ? {
              ...f.drivers,
              id: f.drivers.id,
              organizationId: f.drivers.organization_id,
            }
          : null,
      }));

      return NextResponse.json(mapped);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Drivers API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const { type } = body;

    if (type === 'create-request') {
      const {
        organizationId,
        driverId,
        startTime,
        endTime,
        tripInfo,
      } = body;

      const { data: request, error } = await (supabase as any)
        .from('driver_requests')
        .insert({
          organization_id: organizationId,
          driver_id: driverId,
          requester_id: user.id,
          start_time: startTime,
          end_time: endTime,
          trip_info: tripInfo,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...request,
        id: request.id,
        organizationId: request.organization_id,
        startTime: request.start_time,
        endTime: request.end_time,
        tripInfo: request.trip_info,
      });
    }

    if (type === 'update-request-status') {
      const { requestId, status } = body;

      const { data: request, error } = await (supabase as any)
        .from('driver_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...request,
        id: request.id,
        organizationId: request.organization_id,
        startTime: request.start_time,
        endTime: request.end_time,
      });
    }

    if (type === 'create-schedule') {
      const {
        driverId,
        type: scheduleType,
        startTime,
        endTime,
        tripInfo,
        reason,
      } = body;

      const { data: schedule, error } = await (supabase as any)
        .from('driver_schedules')
        .insert({
          driver_id: driverId,
          type: scheduleType,
          start_time: startTime,
          end_time: endTime,
          trip_info: tripInfo,
          reason,
          status: 'scheduled',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...schedule,
        id: schedule.id,
        driverId: schedule.driver_id,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        tripInfo: schedule.trip_info,
      });
    }

    if (type === 'update-schedule-status') {
      const { scheduleId, status } = body;

      const { data: schedule, error } = await (supabase as any)
        .from('driver_schedules')
        .update({ status })
        .eq('id', scheduleId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...schedule,
        id: schedule.id,
        driverId: schedule.driver_id,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
      });
    }

    if (type === 'submit-rating') {
      const {
        scheduleId,
        requestId,
        passengerId,
        driverId,
        organizationId,
        rating,
        comment,
      } = body;

      const { data: ratingRecord, error } = await (supabase as any)
        .from('passenger_ratings')
        .insert({
          schedule_id: scheduleId,
          request_id: requestId,
          passenger_id: passengerId,
          driver_id: driverId,
          organization_id: organizationId,
          rating,
          comment,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...ratingRecord,
        id: ratingRecord.id,
        scheduleId: ratingRecord.schedule_id,
        requestId: ratingRecord.request_id,
        passengerId: ratingRecord.passenger_id,
        driverId: ratingRecord.driver_id,
        organizationId: ratingRecord.organization_id,
      });
    }

    if (type === 'create-recurring-trip') {
      const {
        organizationId,
        driverId,
        tripInfo,
        schedule,
      } = body;

      const { data: trip, error } = await (supabase as any)
        .from('recurring_trips')
        .insert({
          organization_id: organizationId,
          driver_id: driverId,
          user_id: user.id,
          trip_info: tripInfo,
          schedule,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...trip,
        id: trip.id,
        organizationId: trip.organization_id,
        userId: trip.user_id,
        driverId: trip.driver_id,
        isActive: trip.is_active,
        createdAt: trip.created_at,
        updatedAt: trip.updated_at,
      });
    }

    if (type === 'create-shift') {
      const {
        organizationId,
        driverId,
        startTime,
        endTime,
      } = body;

      const { data: shift, error } = await (supabase as any)
        .from('driver_shifts')
        .insert({
          organization_id: organizationId,
          driver_id: driverId,
          start_time: startTime,
          end_time: endTime,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...shift,
        id: shift.id,
        organizationId: shift.organization_id,
        driverId: shift.driver_id,
        startTime: shift.start_time,
        endTime: shift.end_time,
      });
    }

    if (type === 'end-shift') {
      const { shiftId, endTime } = body;

      const { data: shift, error } = await (supabase as any)
        .from('driver_shifts')
        .update({
          end_time: endTime || new Date().toISOString(),
          is_active: false,
        })
        .eq('id', shiftId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...shift,
        id: shift.id,
        organizationId: shift.organization_id,
        driverId: shift.driver_id,
        startTime: shift.start_time,
        endTime: shift.end_time,
      });
    }

    if (type === 'add-favorite') {
      const { organizationId, userId, driverId } = body;

      const { data: existing } = await (supabase as any)
        .from('passenger_favorites')
        .select('id')
        .eq('passenger_id', userId)
        .eq('driver_id', driverId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ message: 'Already in favorites', id: existing.id });
      }

      const { data: favorite, error } = await (supabase as any)
        .from('passenger_favorites')
        .insert({
          passenger_id: userId,
          driver_id: driverId,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...favorite,
        id: favorite.id,
        passengerId: favorite.passenger_id,
        driverId: favorite.driver_id,
      });
    }

    if (type === 'remove-favorite') {
      const { userId, driverId } = body;

      const { error } = await (supabase as any)
        .from('passenger_favorites')
        .delete()
        .eq('passenger_id', userId)
        .eq('driver_id', driverId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (type === 'register-driver') {
      const { userId, organizationId, vehicleInfo, workingHours, maxTripsPerDay, adminId } = body;

      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .insert({
          userid: userId,
          organizationId: organizationId,
          is_available: true,
          is_on_shift: false,
          vehicle_model: vehicleInfo?.model || '',
          vehicle_plate_number: vehicleInfo?.plateNumber || '',
          vehicle_capacity: vehicleInfo?.capacity || 0,
          vehicle_color: vehicleInfo?.color || null,
          vehicle_year: vehicleInfo?.year || null,
          max_trips_per_day: maxTripsPerDay || 3,
          working_hours_start: workingHours?.start || '09:00',
          working_hours_end: workingHours?.end || '17:00',
          working_days: [1, 2, 3, 4, 5],
          created_at: Date.now(),
          updated_at: Date.now(),
        })
        .select()
        .single();

      if (driverError) {
        return NextResponse.json({ error: driverError.message }, { status: 500 });
      }

      let vehicleId = null;
      if (vehicleInfo) {
        const { data: vehicle, error: vehicleError } = await (supabase as any)
          .from('vehicles')
          .insert({
            organization_id: organizationId,
            driver_id: driver.id,
            model: vehicleInfo.model,
            year: vehicleInfo.year,
            color: vehicleInfo.color,
            plate_number: vehicleInfo.plateNumber,
            capacity: vehicleInfo.capacity,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (vehicleError) {
          return NextResponse.json({ error: vehicleError.message }, { status: 500 });
        }

        vehicleId = vehicle.id;
      }

      return NextResponse.json({
        ...driver,
        id: driver.id,
        organizationId: driver.organizationId,
        userId: driver.userid,
        vehicleModel: driver.vehicle_model,
        vehiclePlateNumber: driver.vehicle_plate_number,
        vehicleCapacity: driver.vehicle_capacity,
        vehicleColor: driver.vehicle_color,
        vehicleYear: driver.vehicle_year,
        isAvailable: driver.is_available,
        isOnShift: driver.is_on_shift,
        maxTripsPerDay: driver.max_trips_per_day,
        vehicleId,
      });
    }

    if (type === 'reassign-request') {
      const { requestId, userId, newDriverId } = body;

      const { data: request, error } = await (supabase as any)
        .from('driver_requests')
        .update({
          driver_id: newDriverId,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...request,
        id: request.id,
        organizationId: request.organization_id,
        startTime: request.start_time,
        endTime: request.end_time,
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Drivers API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
