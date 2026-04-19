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
      case 'get-all-tickets': {
        const { data: tickets, error } = await (supabase as any)
          .from('support_tickets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const mapped = (tickets || []).map((t: any) => ({
          id: t.id,
          ticketNumber: t.ticket_number,
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: t.status,
          category: t.category,
          createdBy: t.created_by,
          creatorName: t.creator?.name || 'Unknown',
          organizationId: t.organizationId,
          organizationName: t.organization?.name || null,
          assignedTo: t.assigned_to,
          chatId: t.chatid,
          chatActivated: t.chat_activated,
          isOverdue: t.sla_deadline ? Date.now() > t.sla_deadline : false,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }));

        return NextResponse.json({ data: mapped });
      }

      case 'get-ticket-stats': {
        const { data: tickets } = await (supabase as any)
          .from('support_tickets')
          .select('status, priority, sla_deadline, created_at');

        const now = Date.now();
        const open = (tickets || []).filter((t: any) => t.status === 'open').length;
        const inProgress = (tickets || []).filter((t: any) => t.status === 'in_progress').length;
        const waitingCustomer = (tickets || []).filter((t: any) => t.status === 'waiting_customer').length;
        const resolved = (tickets || []).filter((t: any) => t.status === 'resolved').length;
        const closed = (tickets || []).filter((t: any) => t.status === 'closed').length;
        const critical = (tickets || []).filter((t: any) => t.priority === 'critical').length;
        const overdue = (tickets || []).filter((t: any) => t.sla_deadline && now > t.sla_deadline).length;

        return NextResponse.json({
          data: {
            total: (tickets || []).length,
            open,
            inProgress,
            waitingCustomer,
            resolved,
            closed,
            critical,
            overdue,
            avgResponseTime: 2,
          },
        });
      }

      case 'get-ticket-by-id': {
        const ticketId = searchParams.get('ticketId');
        if (!ticketId) {
          return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 });
        }

        const { data: ticket, error } = await (supabase as any)
          .from('support_tickets')
          .select('*')
          .eq('id', ticketId)
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const comments = await (supabase as any)
          .from('ticket_comments')
          .select('*')
          .eq('ticketId', ticketId);

        const mapped = {
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          status: ticket.status,
          category: ticket.category,
          createdBy: ticket.created_by,
          creatorName: ticket.creator?.name || 'Unknown',
          organizationId: ticket.organizationId,
          organizationName: ticket.organization?.name || null,
          assignedTo: ticket.assigned_to,
          chatId: ticket.chatid,
          chatActivated: ticket.chat_activated,
          isOverdue: ticket.sla_deadline ? Date.now() > ticket.sla_deadline : false,
          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at,
          comments: (comments.data || []).map((c: any) => ({
            id: c.id,
            message: c.message,
            isInternal: c.is_internal,
            authorId: c.authorid,
            authorName: c.author?.name || 'Unknown',
            createdAt: c.created_at,
          })),
        };

        return NextResponse.json({ data: mapped });
      }

      case 'get-ticket-chat-status': {
        const ticketId = searchParams.get('ticketId');
        if (!ticketId) {
          return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 });
        }

        const { data: ticket, error } = await (supabase as any)
          .from('support_tickets')
          .select('chatid, chat_activated')
          .eq('id', ticketId)
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          data: {
            hasChat: !!ticket?.chatid,
            chatId: ticket?.chatid,
            chatActivated: ticket?.chat_activated || false,
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Tickets API Error]', error);
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
      case 'create-ticket': {
        const { organizationId, createdBy, title, description, priority, category } = body;

        if (!title || !description || !createdBy) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const ticketNumber = `TKT-${Date.now()}`;
        const now = Date.now();

        const { data: ticket, error } = await (supabase as any)
          .from('support_tickets')
          .insert({
            organizationId: organizationId || null,
            ticket_number: ticketNumber,
            title,
            description,
            priority: priority || 'medium',
            status: 'open',
            category: category || 'technical',
            created_by: createdBy,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { ...ticket, ticketNumber } });
      }

      case 'update-ticket-status': {
        const { ticketId, status, userId } = body;

        if (!ticketId || !status) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: ticket, error } = await (supabase as any)
          .from('support_tickets')
          .update({ status, updated_at: Date.now() })
          .eq('id', ticketId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: ticket });
      }

      case 'assign-ticket': {
        const { ticketId, assignedTo } = body;

        if (!ticketId || !assignedTo) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: ticket, error } = await (supabase as any)
          .from('support_tickets')
          .update({ assigned_to: assignedTo, updated_at: Date.now() })
          .eq('id', ticketId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: ticket });
      }

      case 'add-ticket-comment': {
        const { ticketId, authorId, message, isInternal } = body;

        if (!ticketId || !authorId || !message) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const now = Date.now();
        const { data: comment, error } = await (supabase as any)
          .from('ticket_comments')
          .insert({
            ticketid: ticketId,
            authorid: authorId,
            message,
            is_internal: isInternal || false,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: comment });
      }

      case 'resolve-ticket': {
        const { ticketId, resolution, userId } = body;

        if (!ticketId || !resolution || !userId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const now = Date.now();
        const { data: ticket, error } = await (supabase as any)
          .from('support_tickets')
          .update({
            status: 'resolved',
            resolution,
            resolved_by: userId,
            resolved_at: now,
            updated_at: now,
          })
          .eq('id', ticketId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: ticket });
      }

      case 'create-ticket-chat': {
        const { ticketId, superadminId } = body;

        if (!ticketId || !superadminId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: ticket } = await (supabase as any)
          .from('support_tickets')
          .select('title, organizationId')
          .eq('id', ticketId)
          .single();

        if (!ticket) {
          return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const chatName = `Support: ${ticket.title}`;

        const { data: chat, error: chatError } = await (supabase as any)
          .from('chat_conversations')
          .insert({
            name: chatName,
            type: 'support',
            created_by: superadminId,
            organizationId: ticket.organizationId,
            created_at: Date.now(),
          })
          .select()
          .single();

        if (chatError) {
          return NextResponse.json({ error: chatError.message }, { status: 500 });
        }

        const { error: updateError } = await (supabase as any)
          .from('support_tickets')
          .update({ chatid: chat.id, updated_at: Date.now() })
          .eq('id', ticketId);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ data: { chatId: chat.id, chatName } });
      }

      case 'activate-ticket-chat': {
        const { ticketId, superadminId, message } = body;

        if (!ticketId || !superadminId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: ticket } = await (supabase as any)
          .from('support_tickets')
          .select('chatid, ticket_number')
          .eq('id', ticketId)
          .single();

        if (!ticket || !ticket.chatid) {
          return NextResponse.json({ error: 'Chat not found for this ticket' }, { status: 404 });
        }

        const { error: chatUpdateError } = await (supabase as any)
          .from('chat_conversations')
          .update({ updated_at: Date.now() })
          .eq('id', ticket.chatid);

        if (chatUpdateError) {
          return NextResponse.json({ error: chatUpdateError.message }, { status: 500 });
        }

        const { error: ticketUpdateError } = await (supabase as any)
          .from('support_tickets')
          .update({ chat_activated: true, updated_at: Date.now() })
          .eq('id', ticketId);

        if (ticketUpdateError) {
          return NextResponse.json({ error: ticketUpdateError.message }, { status: 500 });
        }

        if (message) {
          await (supabase as any)
            .from('chat_messages')
            .insert({
              conversation_id: ticket.chatid,
              sender_id: superadminId,
              content: message,
              message_type: 'system',
              created_at: Date.now(),
            });
        }

        return NextResponse.json({ data: { chatId: ticket.chatid, activated: true } });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Tickets API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
