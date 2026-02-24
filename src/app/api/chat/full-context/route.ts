import { NextResponse } from 'next/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';

export async function GET() {
  try {
    // Fetch ALL system data in parallel
    const [users, leaves, todayAttendance] = await Promise.all([
      fetchQuery(api.users.getAllUsers, {}),
      fetchQuery(api.leaves.getAllLeaves, {}),
      fetchQuery(api.timeTracking.getTodayAllAttendance, {}),
    ]);

    // Build rich employee map with leave info
    const employeeData = (users as any[]).map((u: any) => {
      const userLeaves = (leaves as any[]).filter((l: any) => l.userId === u._id);
      const todayRecord = (todayAttendance as any[]).find((t: any) => t.userId === u._id);
      
      const approvedLeaves = userLeaves.filter((l: any) => l.status === 'approved');
      const pendingLeaves = userLeaves.filter((l: any) => l.status === 'pending');
      
      // Current/upcoming leaves
      const now = new Date().toISOString().split('T')[0];
      const activeLeave = approvedLeaves.find((l: any) => l.startDate <= now && l.endDate >= now);
      const upcomingLeaves = approvedLeaves
        .filter((l: any) => l.startDate > now)
        .sort((a: any, b: any) => a.startDate.localeCompare(b.startDate))
        .slice(0, 3);

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        position: u.position,
        employeeType: u.employeeType,
        // Today's attendance
        todayStatus: todayRecord ? {
          status: todayRecord.status,
          checkIn: todayRecord.checkInTime ? new Date(todayRecord.checkInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null,
          checkOut: todayRecord.checkOutTime ? new Date(todayRecord.checkOutTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null,
          isLate: todayRecord.isLate,
          lateMinutes: todayRecord.lateMinutes,
          workedHours: todayRecord.totalWorkedMinutes ? (todayRecord.totalWorkedMinutes / 60).toFixed(1) : null,
        } : null,
        // Leave balances
        leaveBalance: u.leaveBalance ?? { paid: 20, sick: 10, family: 5, unpaid: 30 },
        // Currently on leave
        currentLeave: activeLeave ? {
          type: activeLeave.type,
          startDate: activeLeave.startDate,
          endDate: activeLeave.endDate,
          reason: activeLeave.reason,
        } : null,
        // Upcoming leaves
        upcomingLeaves,
        // Pending requests
        pendingLeaves: pendingLeaves.map((l: any) => ({
          type: l.type,
          startDate: l.startDate,
          endDate: l.endDate,
          days: l.days,
        })),
        // Leave history summary
        totalLeavesTaken: approvedLeaves.reduce((sum: number, l: any) => sum + (l.days ?? 0), 0),
      };
    });

    // Calendar events — all approved leaves next 90 days
    const now = new Date().toISOString().split('T')[0];
    const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const calendarEvents = (leaves as any[])
      .filter((l: any) => l.status === 'approved' && l.endDate >= now && l.startDate <= in90Days)
      .map((l: any) => {
        const user = (users as any[]).find((u: any) => u._id === l.userId);
        return {
          employee: user?.name ?? 'Unknown',
          department: user?.department ?? '',
          type: l.type,
          startDate: l.startDate,
          endDate: l.endDate,
          days: l.days,
        };
      })
      .sort((a: any, b: any) => a.startDate.localeCompare(b.startDate));

    // Today's attendance summary
    const presentToday = (todayAttendance as any[]).map((t: any) => {
      const user = (users as any[]).find((u: any) => u._id === t.userId);
      return {
        name: user?.name ?? 'Unknown',
        department: user?.department ?? '',
        status: t.status,
        checkIn: t.checkInTime ? new Date(t.checkInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null,
        checkOut: t.checkOutTime ? new Date(t.checkOutTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null,
        isLate: t.isLate,
        lateMinutes: t.lateMinutes,
      };
    });

    return NextResponse.json({
      employees: employeeData,
      calendarEvents,
      todayAttendance: presentToday,
      totalEmployees: users.length,
      currentlyAtWork: presentToday.filter((t: any) => t.status === 'checked_in').length,
      onLeaveToday: employeeData.filter((e: any) => e.currentLeave).length,
    });
  } catch (error) {
    console.error('Full context error:', error);
    return NextResponse.json({ employees: [], calendarEvents: [], todayAttendance: [] });
  }
}
