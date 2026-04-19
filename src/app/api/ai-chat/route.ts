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
      case 'get-conversations': {
        const { data: conversations } = await supabase
          .from('ai_conversations')
          .select('*')
          .eq('userId', user.id)
          .order('createdAt', { ascending: false });

        return NextResponse.json({ data: conversations || [] });
      }

      case 'get-messages': {
        const conversationId = searchParams.get('conversationId');
        if (!conversationId) {
          return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const { data: messages } = await supabase
          .from('ai_messages')
          .select('*')
          .eq('conversationId', conversationId as string)
          .order('createdAt', { ascending: true });

        return NextResponse.json({ data: messages || [] });
      }

      case 'get-full-context': {
        const { data: userData } = await supabase
          .from('users')
          .select('*, organizations(*)')
          .eq('id', user.id)
          .single();

        if (!userData) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: leaves } = await supabase
          .from('leave_requests')
          .select('id, type, start_date, end_date, status, comment')
          .eq('userid', user.id);

        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, status, priority, deadline')
          .eq('assigned_to', user.id);

        const { data: teamMembers } = await supabase
          .from('users')
          .select('id, name, email, role, department')
          .eq('organizationId', userData.organizationId!)
          .eq('is_active', true);

        const { data: attendance } = await supabase
          .from('time_tracking')
          .select('id, date, check_in_time, check_out_time, status')
          .eq('userId', user.id)
          .order('date', { ascending: false })
          .limit(30);

        return NextResponse.json({
          data: {
            user: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              department: userData.department,
            },
            organization: userData.organizations ? {
              name: userData.organizations.name,
              plan: userData.organizations.plan,
            } : null,
            leaves: (leaves || []).map(l => ({
              id: l.id,
              type: l.type,
              startDate: l.start_date,
              endDate: l.end_date,
              status: l.status,
              reason: l.comment,
            })),
            tasks: (tasks || []).map(t => ({
              id: t.id,
              title: t.title,
              status: t.status,
              priority: t.priority,
              dueDate: t.deadline,
            })),
            teamMembers: (teamMembers || []).map(m => ({
              id: m.id,
              name: m.name,
              email: m.email,
              role: m.role,
              department: m.department,
            })),
            attendance: (attendance || []).map(a => ({
              id: a.id,
              date: a.date,
              checkIn: a.check_in_time,
              checkOut: a.check_out_time,
              status: a.status,
            })),
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[AI Chat API Error]', error);
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
      case 'create-conversation': {
        const { title } = body;

        if (!title) {
          return NextResponse.json({ error: 'Missing title' }, { status: 400 });
        }

        const { data: newConv, error } = await supabase
          .from('ai_conversations')
          .insert({
            userId: user.id,
            title,
          })
          .select()
          .single();

        if (error || !newConv) {
          return NextResponse.json({ error: error?.message || 'Failed to create conversation' }, { status: 500 });
        }

        return NextResponse.json({ data: { conversationId: newConv.id } });
      }

      case 'update-conversation-title': {
        const { conversationId, title } = body;

        if (!conversationId || !title) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabase
          .from('ai_conversations')
          .update({ title, updatedAt: Date.now() })
          .eq('id', conversationId)
          .eq('userId', user.id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'delete-conversation': {
        const { conversationId } = body;

        if (!conversationId) {
          return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        await supabase
          .from('ai_messages')
          .delete()
          .eq('conversationId', conversationId);

        const { error } = await supabase
          .from('ai_conversations')
          .delete()
          .eq('id', conversationId)
          .eq('userId', user.id);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'add-message': {
        const { conversationId, role, content } = body;

        if (!conversationId || !role || !content) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: newMessage, error } = await supabase
          .from('ai_messages')
          .insert({
            conversationId,
            role,
            content,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await supabase
          .from('ai_conversations')
          .update({ updatedAt: Date.now() })
          .eq('id', conversationId);

        return NextResponse.json({ data: { messageId: newMessage.id } });
      }

      case 'create-leave-request': {
        const { requesterId, organizationId, type, startDate, endDate, reason } = body;

        if (!requesterId || !organizationId || !type || !startDate || !endDate) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const now = Date.now();
        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const { data: newLeave, error } = await supabase
          .from('leave_requests')
          .insert({
            userid: requesterId,
            organizationId,
            type,
            start_date: startDate,
            end_date: endDate,
            days,
            reason: reason || '',
            status: 'pending',
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { leaveId: newLeave.id, success: true } });
      }

      case 'create-task': {
        const { assigneeId, assignerId, organizationId, title, description, deadline, priority } = body;

        if (!assigneeId || !assignerId || !organizationId || !title) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const now = Date.now();

        const { data: newTask, error } = await supabase
          .from('tasks')
          .insert({
            assigned_to: assigneeId,
            assigned_by: assignerId,
            organizationId,
            title,
            description: description || null,
            status: 'pending',
            priority: priority || 'medium',
            deadline: deadline || null,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { taskId: newTask.id, success: true } });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[AI Chat API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
