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
    const action = searchParams.get('action');

    switch (action) {
      case 'get-user-360': {
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (!userProfile) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get organization
        let organization = null;
        if (userProfile.organizationId) {
          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', userProfile.organizationId)
            .single();
          organization = org;
        }

        // Get leaves
        const { data: leaves } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('userid', userId)
          .order('created_at', { ascending: false });

        // Get tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', userId)
          .order('created_at', { ascending: false });

        // Get driver requests
        const { data: driverRequests } = await supabase
          .from('driver_requests')
          .select('*')
          .eq('requester.id', userId)
          .order('created_at', { ascending: false });

        // Get support tickets
        const { data: supportTickets } = await (supabase as any)
          .from('support_tickets')
          .select('*')
          .eq('created_by', userId)
          .order('created_at', { ascending: false });

        // Get login attempts
        const { data: loginAttempts } = await supabase
          .from('login_attempts')
          .select('*')
          .eq('userid', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        // Get notifications
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user.id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        // Get chat messages
        const { data: chatMessages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('senderid', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        // Stats
        const approvedLeaves = (leaves || []).filter((l: any) => l.status === 'approved');
        const pendingLeaves = (leaves || []).filter((l: any) => l.status === 'pending');
        const completedTasks = (tasks || []).filter((t: any) => t.status === 'completed');

        const stats = {
          totalLeaves: (leaves || []).length,
          pendingLeaves: pendingLeaves.length,
          approvedLeaves: approvedLeaves.length,
          totalTasks: (tasks || []).length,
          completedTasks: completedTasks.length,
          totalDriverRequests: (driverRequests || []).length,
          totalTickets: (supportTickets || []).length,
          totalLoginAttempts: (loginAttempts || []).length,
        };

        return NextResponse.json({
          data: {
            user: {
              id: userProfile.id,
              name: userProfile.name,
              email: userProfile.email,
              role: userProfile.role,
              department: userProfile.department,
              position: userProfile.position,
              phone: userProfile.phone,
              location: userProfile.location,
              dateOfBirth: userProfile.date_of_birth,
              avatarUrl: userProfile.avatar_url,
              isActive: userProfile.is_active,
              isApproved: userProfile.is_approved,
            },
            organization,
            leaves: (leaves || []).map((l: any) => ({
              id: l.id,
              type: l.leave_type,
              startDate: l.start_date,
              endDate: l.end_date,
              days: l.days,
              status: l.status,
              reason: l.reason,
              reviewComment: l.review_comment,
              reviewerName: l.reviewer_name,
              createdAt: l.created_at,
            })),
            tasks: (tasks || []).map((t: any) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              status: t.status,
              priority: t.priority,
              deadline: t.deadline,
              createdAt: t.created_at,
            })),
            driverRequests: (driverRequests || []).map((d: any) => ({
              id: d.id,
              status: d.status,
              priority: d.priority,
              startTime: d.start_time,
              tripInfo: d.trip_info,
              driverName: d.driver_name,
              driverPhone: d.driver_phone,
            })),
            supportTickets: (supportTickets || []).map((t: any) => ({
              id: t.id,
              ticketNumber: t.ticket_number,
              title: t.title,
              description: t.description,
              status: t.status,
              priority: t.priority,
              createdAt: t.created_at,
            })),
            stats,
            loginAttempts: loginAttempts || [],
            notifications: notifications || [],
            chatMessages: chatMessages || [],
          },
        });
      }

      case 'global-search': {
        const query = searchParams.get('query') || '';
        const limit = parseInt(searchParams.get('limit') || '20');

        if (query.length < 2) {
          return NextResponse.json({
            data: {
              users: [],
              organizations: [],
              leaveRequests: [],
              tasks: [],
              driverRequests: [],
              supportTickets: [],
              total: 0,
            },
          });
        }

        const searchPattern = `%${query}%`;

        // Search users
        const { data: users } = await supabase
          .from('users')
          .select('id, name, email, organizationId')
          .ilike('name', searchPattern)
          .limit(limit);

        // Search organizations
        const { data: organizations } = await supabase
          .from('organizations')
          .select('id, name, plan, slug')
          .ilike('name', searchPattern)
          .limit(limit);

        // Search leave requests
        const { data: leaveRequests } = await supabase
          .from('leave_requests')
          .select(`
            id,
            userid,
            leave_type,
            start_date,
            end_date,
            status,
            user:users!userid(name)
          `)
          .or(`reason.ilike.${searchPattern},leave_type.ilike.${searchPattern}`)
          .limit(limit);

        // Search tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, description, status, priority')
          .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
          .limit(limit);

        // Search driver requests
        const { data: driverRequests } = await supabase
          .from('driver_requests')
          .select(`
            id,
            requester_id,
            status,
            trip_info,
            requester:users!requester_id(name)
          `)
          .ilike('status', searchPattern)
          .limit(limit);

        // Search support tickets
        const { data: supportTickets } = await (supabase as any)
          .from('support_tickets')
          .select('id, ticket_number, title, status, priority')
          .or(`title.ilike.${searchPattern},ticket_number.ilike.${searchPattern}`)
          .limit(limit);

        const mappedLeaveRequests = (leaveRequests || []).map((l: any) => ({
          id: l.id,
          userName: l.user?.name || 'Unknown',
          type: l.leave_type,
          startDate: l.start_date,
          endDate: l.end_date,
          status: l.status,
        }));

        const mappedDriverRequests = (driverRequests || []).map((d: any) => ({
          id: d.id,
          requesterName: d.requester?.name || 'Unknown',
          status: d.status,
          tripInfo: d.trip_info,
        }));

        return NextResponse.json({
          data: {
            users: users || [],
            organizations: organizations || [],
            leaveRequests: mappedLeaveRequests,
            tasks: tasks || [],
            driverRequests: mappedDriverRequests,
            supportTickets: supportTickets || [],
            total: (users?.length || 0) + (organizations?.length || 0) +
                   (leaveRequests?.length || 0) + (tasks?.length || 0) +
                   (driverRequests?.length || 0) + (supportTickets?.length || 0),
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Superadmin API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
