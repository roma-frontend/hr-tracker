import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'get-service-broadcasts') {
      const organizationId = searchParams.get('organizationId');

      if (!organizationId) {
        return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
      }

      const { data: broadcasts, error } = await supabase
        .from('service_broadcasts')
        .select('*, users!createdBy(name, avatar_url)')
        .eq('organizationId', organizationId)
        .order('createdAt', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const mapped = (broadcasts || []).map((b: any) => ({
        id: b.id,
        organizationId: b.organizationId,
        title: b.title,
        content: b.content,
        icon: b.icon,
        senderName: b.users?.name || 'Unknown',
        senderAvatar: b.users?.avatar_url,
        createdAt: b.createdAt,
      }));

      return NextResponse.json({ data: mapped });
    }

    if (action === 'get-maintenance-mode') {
      const organizationId = searchParams.get('organizationId');

      if (!organizationId) {
        return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
      }

      const { data: maintenance, error } = await supabase
        .from('maintenance_modes')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!maintenance) {
        return NextResponse.json({ data: null });
      }

      return NextResponse.json({
        data: {
          id: maintenance.id,
          organizationId: maintenance.organization_id,
          title: maintenance.title,
          message: maintenance.message,
          startTime: maintenance.start_time,
          endTime: maintenance.end_time,
          estimatedDuration: maintenance.estimated_duration,
          icon: maintenance.icon,
          isActive: maintenance.is_active,
          createdBy: maintenance.enabled_by,
        },
      });
    }

    if (action === 'get-calendar-export-data') {
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*, users(name)')
        .eq('status', 'approved')
        .gte('end_date', new Date().toISOString().split('T')[0]);

      if (!leaves) {
        return NextResponse.json({ data: [] });
      }

      const mapped = leaves.map((l: any) => ({
        id: l.id,
        title: `${l.users?.name || 'Unknown'} - ${l.leave_type}`,
        startDate: l.start_date,
        endDate: l.end_date,
        type: l.leave_type,
        reason: l.reason,
      }));

      return NextResponse.json({ data: mapped });
    }

    if (action === 'get-cost-analysis') {
      const period = searchParams.get('period') || 'month';

      const startDate = new Date();
      if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === 'quarter') {
        startDate.setMonth(startDate.getMonth() - 3);
      } else if (period === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*, users!leave_requests_userid_fkey(department, position)')
        .eq('status', 'approved')
        .gte('created_at', startDate.getTime());

      if (!leaves || leaves.length === 0) {
        return NextResponse.json({
          data: {
            totalCost: 0,
            totalLeaves: 0,
            totalDays: 0,
            byDepartment: [],
            byType: [],
          },
        });
      }

      const totalLeaves = leaves.length;
      const totalDays = leaves.reduce((sum: number, l: any) => sum + (l.days || 0), 0);
      const totalCost = totalDays * 100;

      const deptMap: Record<string, { name: string; cost: number; days: number }> = {};
      const typeMap: Record<string, { type: string; cost: number; days: number }> = {};

      leaves.forEach((l: any) => {
        const dept = l.users?.department || 'Unknown';
        const days = l.days || 0;
        const cost = days * 100;

        if (!deptMap[dept]) {
          deptMap[dept] = { name: dept, cost: 0, days: 0 };
        }
        deptMap[dept].cost += cost;
        deptMap[dept].days += days;

        const type = l.leave_type || 'unknown';
        if (!typeMap[type]) {
          typeMap[type] = { type, cost: 0, days: 0 };
        }
        typeMap[type].cost += cost;
        typeMap[type].days += days;
      });

      const byDepartment = Object.values(deptMap).map((d) => ({
        ...d,
        percentage: totalCost > 0 ? Math.round((d.cost / totalCost) * 100) : 0,
      }));

      const byType = Object.values(typeMap).map((t) => ({
        ...t,
        percentage: totalCost > 0 ? Math.round((t.cost / totalCost) * 100) : 0,
      }));

      return NextResponse.json({
        data: {
          totalCost,
          totalLeaves,
          totalDays,
          byDepartment,
          byType,
        },
      });
    }

    if (action === 'detect-conflicts') {
      const organizationId = searchParams.get('organizationId');

      if (!organizationId) {
        return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
      }

      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*, users!leave_requests_userid_fkey(name, department)')
        .eq('organizationId', organizationId)
        .eq('status', 'approved');

      if (!leaves) {
        return NextResponse.json({ data: [] });
      }

      const conflicts: any[] = [];
      const dateDeptMap: Record<string, Record<string, any[]>> = {};

      leaves.forEach((l: any) => {
        const dept = l.users?.department || 'Unknown';
        const startDate = new Date(l.start_date);
        const endDate = new Date(l.end_date);
        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (!dateStr) continue;
          if (!dateDeptMap[dateStr]) {
            dateDeptMap[dateStr] = {};
          }
          const deptKey = dept as string;
          if (!dateDeptMap[dateStr][deptKey]) {
            dateDeptMap[dateStr][deptKey] = [];
          }
          dateDeptMap[dateStr][deptKey].push(l);
        }
      });

      Object.entries(dateDeptMap).forEach(([date, depts]) => {
        Object.entries(depts).forEach(([dept, deptLeaves]: [string, any]) => {
          if (deptLeaves.length >= 3) {
            conflicts.push({
              id: `${date}-${dept}`,
              department: dept,
              date,
              severity: deptLeaves.length >= 5 ? 'critical' : 'warning',
              employeesOut: deptLeaves.map((l: any) => l.users?.name),
              recommendation: `Consider limiting concurrent leaves in ${dept} department`,
            });
          }
        });
      });

      return NextResponse.json({ data: conflicts });
    }

    if (action === 'get-smart-suggestions') {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Admin API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const action = req.nextUrl.searchParams.get('action');

    if (action === 'send-service-broadcast') {
      const { organizationId, userId, title, content, icon } = body;

      if (!organizationId || !userId || !title || !content) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const { data: broadcast, error } = await supabase
        .from('service_broadcasts')
        .insert({
          organizationId: organizationId,
          title,
          content,
          icon: icon || 'ℹ️',
          createdBy: userId,
          createdAt: Date.now(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: broadcast });
    }

    if (action === 'enable-maintenance-mode') {
      const { organizationId, userId, title, message, startTime, estimatedDuration, icon } = body;

      if (!organizationId || !userId || !title || !startTime) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const { data: maintenance, error } = await supabase
        .from('maintenance_modes')
        .insert({
          organization_id: organizationId,
          title,
          message,
          start_time: startTime,
          estimated_duration: estimatedDuration || null,
          icon: icon || '🔧',
          enabled_by: userId,
          is_active: true,
          created_at: Date.now(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: maintenance });
    }

    if (action === 'disable-maintenance-mode') {
      const { organizationId, userId } = body;

      if (!organizationId || !userId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const { data: maintenance, error } = await supabase
        .from('maintenance_modes')
        .update({
          is_active: false,
          end_time: Date.now(),
          updated_at: Date.now(),
        })
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .select()
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: maintenance });
    }

    if (action === 'delete-message') {
      const { messageId, userId, deleteForEveryone } = body;

      if (!messageId || !userId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const { error } = await supabase
        .from('service_broadcasts')
        .delete()
        .eq('id', messageId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Admin API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
