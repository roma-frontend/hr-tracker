import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrgMembers } from '@/lib/server/organizations';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'get-all-users': {
        const requesterId = searchParams.get('requesterId');
        if (!requesterId) {
          return NextResponse.json({ error: 'Missing requesterId' }, { status: 400 });
        }

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('is_active', true)
          .eq('is_approved', true)
          .neq('email', 'romangulanyan@gmail.com')
          .order('name');

        return NextResponse.json({ data: userData || [] });
      }

      case 'get-supervisors': {
        const organizationId = searchParams.get('organizationId');
        const requesterId = searchParams.get('requesterId');
        
        if (!organizationId || !requesterId) {
          return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const { data: supervisors } = await supabase
          .from('users')
          .select('*')
          .eq('organizationId', organizationId)
          .in('role', ['admin', 'supervisor'])
          .eq('is_active', true)
          .order('name');

        return NextResponse.json({ data: supervisors || [] });
      }

      case 'get-user-by-id': {
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        return NextResponse.json({ data: userData });
      }

      case 'get-org-users': {
        const organizationId = searchParams.get('organizationId');
        if (!organizationId) {
          return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
        }

        const { data: users } = await supabase
          .from('users')
          .select('*')
          .eq('organizationId', organizationId)
          .eq('is_active', true)
          .eq('is_approved', true)
          .order('name');

        return NextResponse.json({ data: users || [] });
      }

      case 'get-my-employees': {
        const supervisorId = searchParams.get('supervisorId');
        if (!supervisorId) {
          return NextResponse.json({ error: 'Missing supervisorId' }, { status: 400 });
        }

        const { data: users } = await supabase
          .from('users')
          .select('*')
          .eq('supervisorid', supervisorId)
          .eq('is_active', true)
          .eq('is_approved', true)
          .order('name');

        return NextResponse.json({ data: users || [] });
      }

      case 'get-current-user': {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        return NextResponse.json({ data: userData });
      }

      case 'update-own-profile': {
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const phone = searchParams.get('phone');
        const location = searchParams.get('location');

        if (!name || !email) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updateData: any = { name, email };
        if (phone !== undefined) updateData.phone = phone;
        if (location !== undefined) updateData.location = location;

        const { data: updatedUser, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: updatedUser });
      }

      case 'get-user-stats': {
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (!userData) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: userLeaves } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('userid', userId);

        const approved = (userLeaves || []).filter((l: any) => l.status === 'approved');
        const pending = (userLeaves || []).filter((l: any) => l.status === 'pending');

        const totalDaysUsed = approved.reduce((sum: number, l: any) => sum + (l.days ?? 0), 0);
        const totalDaysPending = pending.reduce((sum: number, l: any) => sum + (l.days ?? 0), 0);

        const { data: userTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', userId);

        const completedTasks = (userTasks || []).filter((t: any) => t.status === 'completed').length;
        const totalTasks = (userTasks || []).length;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const { data: userMessages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('senderid', userId);

        const projects = new Set(
          (userTasks || [])
            .filter((t: any) => t.project_id)
            .map((t: any) => t.project_id)
        );

        const daysActive = userData.created_at
          ? Math.floor((Date.now() - userData.created_at) / (1000 * 60 * 60 * 24))
          : 0;

        const stats = {
          userId: userData.id,
          userName: userData.name,
          department: userData.department,
          position: userData.position || 'N/A',
          avatar: userData.avatar_url,
          joinDate: userData.created_at,
          leaveStats: {
            totalDaysUsed,
            totalDaysPending,
            approvedLeaves: approved.length,
            pendingLeaves: pending.length,
            rejectedLeaves: (userLeaves || []).filter((l: any) => l.status === 'rejected').length,
            balances: {
              paid: userData.paid_leave_balance ?? 20,
              sick: userData.sick_leave_balance ?? 10,
              family: userData.family_leave_balance ?? 5,
            },
          },
          taskStats: {
            totalTasks,
            completedTasks,
            completionRate: Math.round(taskCompletionRate),
            pendingTasks: (userTasks || []).filter((t: any) => t.status !== 'completed').length,
          },
          activityStats: {
            totalMessages: (userMessages || []).length,
            lastActive: (userMessages || []).length > 0
              ? Math.max(...(userMessages || []).map((m: any) => m.created_at ?? 0))
              : null,
          },
          daysActive,
          tasksCompleted: completedTasks,
          leavesTaken: approved.length,
          projects: projects.size,
          productivityScore: Math.round(
            (taskCompletionRate * 0.4) +
            (Math.min((userMessages || []).length / 100, 1) * 100 * 0.3)
          ),
        };

        return NextResponse.json({ data: stats });
      }

      case 'get-pending-approvals': {
        const { data: adminProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!adminProfile || !['admin', 'superadmin'].includes(adminProfile.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let query = supabase
          .from('users')
          .select('*')
          .eq('is_approved', false)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (adminProfile.role !== 'superadmin' && adminProfile.organizationId) {
          query = query.eq('organizationId', adminProfile.organizationId);
        }

        const { data: pendingUsers } = await query;

        const mapped = (pendingUsers || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          employeeType: u.employee_type,
          department: u.department,
          position: u.position,
          phone: u.phone,
          avatarUrl: u.avatar_url,
          createdAt: u.created_at,
          organizationId: u.organizationId,
        }));

        return NextResponse.json({ data: mapped });
      }

      case 'get-join-requests': {
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { data: requests, error } = await supabase
          .from('organization_invites')
          .select('*')
          .eq('requested_by_email', userId)
          .order('created_at', { ascending: false });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const mapped = (requests || []).map((r: any) => ({
          id: r.id,
          status: r.status,
          organizationId: r.organization_id,
          requestedBy: r.requested_by,
          requestedAt: r.created_at,
          rejectionReason: r.rejection_reason,
        }));

        return NextResponse.json({ data: mapped });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Users API Error]', error);
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
    const action = request.nextUrl.searchParams.get('action');

    switch (action) {
      case 'create': {
        const {
          adminId,
          name,
          email,
          passwordHash,
          role,
          department,
          position,
          employeeType,
          phone,
          organizationId,
        } = body;

        if (!adminId || !name || !email || !role || !passwordHash) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            name,
            email,
            password_hash: passwordHash,
            role,
            department: department || null,
            position: position || null,
            employee_type: employeeType || 'staff',
            phone: phone || null,
            organizationId: organizationId || null,
            is_active: true,
            is_approved: true,
            paid_leave_balance: 24,
            sick_leave_balance: 10,
            family_leave_balance: 5,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: newUser });
      }

      case 'update': {
        const {
          adminId,
          userId,
          name,
          role,
          employeeType,
          department,
          position,
          phone,
          supervisorId,
          isActive,
          paidLeaveBalance,
          sickLeaveBalance,
          familyLeaveBalance,
        } = body;

        if (!adminId || !userId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = role;
        if (employeeType !== undefined) updateData.employee_type = employeeType;
        if (department !== undefined) updateData.department = department;
        if (position !== undefined) updateData.position = position;
        if (phone !== undefined) updateData.phone = phone;
        if (supervisorId !== undefined) updateData.supervisorid = supervisorId;
        if (isActive !== undefined) updateData.is_active = isActive;
        if (paidLeaveBalance !== undefined) updateData.paid_leave_balance = paidLeaveBalance;
        if (sickLeaveBalance !== undefined) updateData.sick_leave_balance = sickLeaveBalance;
        if (familyLeaveBalance !== undefined) updateData.family_leave_balance = familyLeaveBalance;

        const { data: updatedUser, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: updatedUser });
      }

      case 'delete': {
        const { adminId, userId } = body;

        if (!adminId || !userId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'update-presence-status': {
        const { userId, presenceStatus, outOfOfficeMessage } = body;

        if (!userId || !presenceStatus) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const validStatuses = ['available', 'in_meeting', 'in_call', 'out_of_office', 'busy'];
        if (!validStatuses.includes(presenceStatus)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({ presence_status: presenceStatus })
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true, newStatus: presenceStatus } });
      }

      case 'approve-user': {
        const { userId } = body;

        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { data: adminProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!adminProfile || !['admin', 'superadmin'].includes(adminProfile.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const now = Date.now();
        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({
            is_approved: true,
            approved_by: user.id,
            approved_at: now,
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: updatedUser });
      }

      case 'reject-user': {
        const { userId } = body;

        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { data: adminProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!adminProfile || !['admin', 'superadmin'].includes(adminProfile.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'delete-avatar': {
        const { userId } = body;

        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { error } = await supabase
          .from('users')
          .update({ avatar_url: null })
          .eq('id', userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'suspend-user': {
        const { adminId, userId: targetUserId, reason, duration } = body;

        if (!adminId || !targetUserId || !reason) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: adminProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', adminId)
          .single();

        if (!adminProfile || !['admin', 'superadmin'].includes(adminProfile.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const now = Date.now();
        const suspendedUntil = duration ? now + (duration * 60 * 60 * 1000) : null;

        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({
            is_suspended: true,
            suspended_reason: reason,
            suspended_until: suspendedUntil,
            suspended_at: now,
            suspended_by: adminId,
          })
          .eq('id', targetUserId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: updatedUser });
      }

      case 'unsuspend-user': {
        const { adminId, userId: targetUserId } = body;

        if (!adminId || !targetUserId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: adminProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', adminId)
          .single();

        if (!adminProfile || !['admin', 'superadmin'].includes(adminProfile.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({
            is_suspended: false,
            suspended_reason: null,
            suspended_until: null,
            suspended_at: null,
            suspended_by: null,
          })
          .eq('id', targetUserId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: updatedUser });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Users API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
