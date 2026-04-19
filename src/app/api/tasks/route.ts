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
      case 'get-my-tasks': {
        const userId = searchParams.get('userId');
        const organizationId = searchParams.get('organizationId');
        const status = searchParams.get('status');
        
        if (!userId || !organizationId) {
          return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        let query = supabase
          .from('tasks')
          .select(`
            *,
            assigned_to:users!tasks_assigned_to_fkey(id, name, avatar_url, department, position),
            assigned_by:users!tasks_assigned_by_fkey(id, name, avatar_url)
          `)
          .eq('organizationId', organizationId)
          .eq('assigned_to', userId);

        if (status) {
          query = query.eq('status', status as 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled');
        }

        const { data: tasks } = await query.order('deadline', { ascending: true, nullsFirst: true });

        const formattedTasks = tasks?.map(task => ({
          id: task.id,
          organizationId: task.organizationId,
          title: task.title,
          description: task.description,
          assignedto: task.assigned_to,
          assignedby: task.assigned_by,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          completedat: task.completed_at,
          tags: task.tags,
          attachmenturl: task.attachment_url,
          attachments: task.attachments,
          createdat: task.created_at,
          updatedat: task.updated_at,
          assigned_to: task.assigned_to,
          assigned_by: task.assigned_by,
        })) || [];

        return NextResponse.json({ data: formattedTasks });
      }

      case 'get-org-tasks': {
        const organizationId = searchParams.get('organizationId');
        const status = searchParams.get('status');
        const assignedTo = searchParams.get('assignedTo');
        
        if (!organizationId) {
          return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
        }

        let query = supabase
          .from('tasks')
          .select(`
            *,
            assigned_to:users!tasks_assigned_to_fkey(id, name, avatar_url, department, position),
            assigned_by:users!tasks_assigned_by_fkey(id, name, avatar_url)
          `)
          .eq('organizationId', organizationId);

        if (status) {
          query = query.eq('status', status as 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled');
        }
        if (assignedTo) {
          query = query.eq('assigned_to', assignedTo);
        }

        const { data: tasks } = await query.order('deadline', { ascending: true, nullsFirst: true });

        const formattedTasks = tasks?.map(task => ({
          id: task.id,
          organizationId: task.organizationId,
          title: task.title,
          description: task.description,
          assignedto: task.assigned_to,
          assignedby: task.assigned_by,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          completedat: task.completed_at,
          tags: task.tags,
          attachmenturl: task.attachment_url,
          attachments: task.attachments,
          createdat: task.created_at,
          updatedat: task.updated_at,
          assigned_to: task.assigned_to,
          assigned_by: task.assigned_by,
        })) || [];

        return NextResponse.json({ data: formattedTasks });
      }

      case 'get-task-by-id': {
        const taskId = searchParams.get('taskId');
        
        if (!taskId) {
          return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
        }

        const { data: task } = await supabase
          .from('tasks')
          .select(`
            *,
            assigned_to:users!tasks_assigned_to_fkey(id, name, avatar_url, department, position),
            assigned_by:users!tasks_assigned_by_fkey(id, name, avatar_url)
          `)
          .eq('id', taskId)
          .single();

        if (!task) {
          return NextResponse.json({ data: null });
        }

        const formattedTask = {
          id: task.id,
          organizationId: task.organizationId,
          title: task.title,
          description: task.description,
          assignedto: task.assigned_to,
          assignedby: task.assigned_by,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          completedat: task.completed_at,
          tags: task.tags,
          attachmenturl: task.attachment_url,
          attachments: task.attachments,
          createdat: task.created_at,
          updatedat: task.updated_at,
          assigned_to: task.assigned_to,
          assigned_by: task.assigned_by,
        };

        return NextResponse.json({ data: formattedTask });
      }

      case 'get-task-comments': {
        const taskId = searchParams.get('taskId');
        
        if (!taskId) {
          return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
        }

        const { data: comments } = await supabase
          .from('task_comments')
          .select(`
            *,
            author:users(id, name, avatar_url)
          `)
          .eq('taskid', taskId)
          .order('createdat', { ascending: true });

        const formattedComments = comments?.map(comment => ({
          id: comment.id,
          taskid: comment.taskid,
          authorid: comment.authorid,
          content: comment.content,
          createdat: comment.createdat,
          author: comment.author,
        })) || [];

        return NextResponse.json({ data: formattedComments });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Tasks API Error]', error);
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
      case 'create-task': {
        const { organizationId, title, description, assignedTo, assignedBy, status, priority, deadline, tags, attachments } = body;

        if (!organizationId || !title || !assignedTo || !assignedBy) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: newTask, error } = await supabase
          .from('tasks')
          .insert({
            organizationId: organizationId,
            title,
            description: description || null,
            assigned_to: assignedTo,
            assigned_by: assignedBy,
            status: status || 'pending',
            priority: priority || 'medium',
            deadline: deadline || null,
            tags: tags || [],
            attachments: attachments || [],
            created_at: Date.now(),
            updated_at: Date.now(),
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: newTask });
      }

      case 'update-task': {
        const { taskId, title, description, assignedTo, status, priority, deadline, tags, attachments } = body;

        if (!taskId) {
          return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
        }

        const updateData: any = { updated_at: Date.now() };
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        if (deadline !== undefined) updateData.deadline = deadline;
        if (tags !== undefined) updateData.tags = tags;
        if (attachments !== undefined) updateData.attachments = attachments;
        if (status === 'completed' && body.status !== 'completed') {
          updateData.completed_at = Date.now();
        }

        const { data: updatedTask, error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', taskId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: updatedTask });
      }

      case 'delete-task': {
        const { taskId } = body;

        if (!taskId) {
          return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
        }

        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'add-comment': {
        const { taskId, authorId, content } = body;

        if (!taskId || !authorId || !content) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: newComment, error } = await supabase
          .from('task_comments')
          .insert({
            taskid: taskId,
            authorid: authorId,
            content,
            createdat: Date.now(),
          })
          .select('*, author:users(id, name, avatar_url)')
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: newComment });
      }

      case 'delete-comment': {
        const { commentId } = body;

        if (!commentId) {
          return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
        }

        const { error } = await supabase
          .from('task_comments')
          .delete()
          .eq('id', commentId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Tasks API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
