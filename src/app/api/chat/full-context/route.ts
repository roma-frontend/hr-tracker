import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Opt out of static generation — uses request.url
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const requesterId = req.nextUrl.searchParams.get('requesterId');
    if (!requesterId) return NextResponse.json({ error: 'requesterId required' }, { status: 400 });

    const supabase = await createClient();

    const { data: requesterUser } = await supabase.from('users').select('organizationId').eq('id', requesterId).single();
    const organizationId = requesterUser?.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const [users, leaves, todayAttendance, allTasks] = await Promise.all([
      supabase.from('users').select('*').eq('organizationId', organizationId),
      supabase.from('leave_requests').select('*').eq('organizationId', organizationId),
      supabase.from('time_tracking').select('*').eq('userId', requesterId || '').eq('date', new Date().toISOString().split('T')[0] || ''),
      supabase.from('tasks').select('*').eq('organizationId', organizationId),
    ]);

    // Build rich employee map with leave info
    // Filter out superadmins from employee data
    const filteredUsers = (users.data as any[]).filter((u: any) => u.role !== 'superadmin');

    const employeeData = filteredUsers.map((u: any) => {
      const userLeaves = (leaves.data as any[]).filter((l: any) => l.userid === u.id);
      const todayRecord = (todayAttendance.data as any[]).find((t: any) => t.userid === u.id);

      const approvedLeaves = userLeaves.filter((l: any) => l.status === 'approved');
      const pendingLeaves = userLeaves.filter((l: any) => l.status === 'pending');

      // Current/upcoming leaves
      const now = new Date().toISOString().split('T')[0] || '';
      const activeLeave = approvedLeaves.find((l: any) => l.start_date <= now && l.end_date >= now);
      const upcomingLeaves = approvedLeaves
        .filter((l: any) => l.start_date > now)
        .sort((a: any, b: any) => a.start_date.localeCompare(b.start_date))
        .slice(0, 3);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        position: u.position,
        employeeType: u.employee_type,
        // Today's attendance
        todayStatus: todayRecord
          ? {
              status: todayRecord.status,
              checkIn: todayRecord.check_in_time
                ? new Date(todayRecord.check_in_time).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null,
              checkOut: todayRecord.check_out_time
                ? new Date(todayRecord.check_out_time).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null,
              isLate: todayRecord.is_late,
              lateMinutes: todayRecord.late_minutes,
              workedHours: todayRecord.total_worked_minutes
                ? (todayRecord.total_worked_minutes / 60).toFixed(1)
                : null,
            }
          : null,
        // Leave balances
        leaveBalance: { paid: u.paid_leave_balance, sick: u.sick_leave_balance, family: u.family_leave_balance, unpaid: 30 },
        // Currently on leave — include real leaveId for edit/delete!
        currentLeave: activeLeave
          ? {
              leaveId: activeLeave.id,
              type: activeLeave.type,
              startDate: activeLeave.start_date,
              endDate: activeLeave.end_date,
              reason: activeLeave.reason,
              status: activeLeave.status,
            }
          : null,
        // Upcoming leaves — include real leaveId!
        upcomingLeaves: upcomingLeaves.map((l: any) => ({
          leaveId: l.id,
          type: l.type,
          startDate: l.start_date,
          endDate: l.end_date,
          days: l.days,
          status: l.status,
        })),
        // Pending requests — include real leaveId!
        pendingLeaves: pendingLeaves.map((l: any) => ({
          leaveId: l.id,
          type: l.type,
          startDate: l.start_date,
          endDate: l.end_date,
          days: l.days,
          status: l.status,
        })),
        // ALL leaves for this employee (for edit/delete)
        allLeaves: userLeaves.map((l: any) => ({
          leaveId: l.id,
          type: l.type,
          startDate: l.start_date,
          endDate: l.end_date,
          days: l.days,
          status: l.status,
          reason: l.reason,
        })),
        // Leave history summary
        totalLeavesTaken: approvedLeaves.reduce((sum: number, l: any) => sum + (l.days ?? 0), 0),
        // Supervisor
        supervisorName: u.supervisorid
          ? ((users.data as any[]).find((s: any) => s.id === u.supervisorid)?.name ?? null)
          : null,
        // Presence status
        presenceStatus: u.presence_status ?? 'available',
        // Tasks
        tasks: (allTasks.data as any[])
          .filter((t: any) => t.assigned_to === u.id)
          .map((t: any) => ({
            taskId: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            deadline: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : null,
            assignedBy:
              (users.data as any[]).find((s: any) => s.id === t.assigned_by)?.name ?? 'Unknown',
          })),
      };
    });

    // Calendar events — all approved leaves next 90 days
    const now = new Date().toISOString().split('T')[0] || '';
    const in90Days =
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '';
    const calendarEvents = (leaves.data as any[])
      .filter((l: any) => l.status === 'approved' && l.end_date >= now && l.start_date <= in90Days)
      .map((l: any) => {
        const user = (users.data as any[]).find((u: any) => u.id === l.userid);
        return {
          employee: user?.name ?? 'Unknown',
          department: user?.department ?? '',
          type: l.type,
          startDate: l.start_date,
          endDate: l.end_date,
          days: l.days,
        };
      })
      .sort((a: any, b: any) => a.startDate.localeCompare(b.startDate));

    // Today's attendance summary
    const presentToday = (todayAttendance.data as any[]).map((t: any) => {
      const user = (users.data as any[]).find((u: any) => u.id === t.userid);
      return {
        name: user?.name ?? 'Unknown',
        department: user?.department ?? '',
        status: t.status,
        checkIn: t.check_in_time
          ? new Date(t.check_in_time).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : null,
        checkOut: t.check_out_time
          ? new Date(t.check_out_time).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : null,
        isLate: t.is_late,
        lateMinutes: t.late_minutes,
      };
    });

    return NextResponse.json({
      employees: employeeData,
      calendarEvents,
      todayAttendance: presentToday,
      totalEmployees: filteredUsers.length,
      currentlyAtWork: presentToday.filter((t: any) => t.status === 'checked_in').length,
      onLeaveToday: employeeData.filter((e: any) => e.currentLeave).length,
    });
  } catch (error) {
    console.error('Full context error:', error);
    return NextResponse.json({ employees: [], calendarEvents: [], todayAttendance: [] });
  }
}
