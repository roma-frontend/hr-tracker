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
      case 'get-org-users': {
        const organizationId = searchParams.get('organizationId');
        const currentUserId = searchParams.get('currentUserId');
        
        if (!organizationId || !currentUserId) {
          return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const { data: users } = await supabase
          .from('users')
          .select('*')
          .eq('organizationId', organizationId)
          .eq('is_active', true)
          .eq('is_approved', true)
          .neq('id', currentUserId)
          .order('name');

        return NextResponse.json({ data: users || [] });
      }

      case 'get-conversation-members': {
        const conversationId = searchParams.get('conversationId');
        if (!conversationId) {
          return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const { data: conversation } = await supabase
          .from('chat_conversations')
          .select('created_by')
          .eq('id', conversationId)
          .single();

        const { data: messages } = await supabase
          .from('chat_messages')
          .select('senderid')
          .eq('conversationid', conversationId);

        const memberIds = new Set<string>();
        if (conversation?.created_by) {
          memberIds.add(conversation.created_by);
        }
        messages?.forEach(msg => memberIds.add(msg.senderid));

        const { data: users } = await supabase
          .from('users')
          .select('*')
          .in('id', Array.from(memberIds));

        const members = users?.map(u => ({
          userId: u.id,
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            avatarUrl: u.avatar_url,
            presenceStatus: u.presence_status,
            department: u.department,
            position: u.position,
          }
        })) || [];

        return NextResponse.json({ data: members });
      }

      case 'get-my-conversations': {
        const userId = searchParams.get('userId');
        const organizationId = searchParams.get('organizationId');
        
        if (!userId || !organizationId) {
          return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const { data: conversations } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('organizationId', organizationId)
          .eq('is_deleted', false)
          .order('last_message_at', { ascending: false, nullsFirst: false });

        if (!conversations) {
          return NextResponse.json({ data: [] });
        }

        const formattedConversations = await Promise.all(
          conversations.map(async (conv) => {
            const { data: messages } = await supabase
              .from('chat_messages')
              .select('senderid')
              .eq('conversationid', conv.id);

            const memberIds = new Set<string>([conv.created_by]);
            messages?.forEach(msg => memberIds.add(msg.senderid));

            const { data: members } = await supabase
              .from('users')
              .select('id, name, avatar_url')
              .in('id', Array.from(memberIds));

            let otherUser = null;
            if (conv.type === 'direct') {
              const otherMember = members?.find(m => m.id !== userId);
              if (otherMember) {
                otherUser = {
                  id: otherMember.id,
                  name: otherMember.name,
                  avatarUrl: otherMember.avatar_url,
                };
              }
            }

            return {
              id: conv.id,
              type: conv.type,
              name: conv.name,
              avatarUrl: conv.avatar_url,
              lastMessageAt: conv.last_message_at,
              lastMessageText: conv.last_message_text,
              lastMessageSenderId: conv.last_message_senderid,
              isPinned: conv.is_pinned,
              isArchived: conv.is_archived,
              isDeleted: conv.is_deleted,
              membership: {
                unreadCount: 0,
                isMuted: false,
                isDeleted: conv.is_deleted || false,
                isArchived: conv.is_archived || false,
              },
              otherUser,
              memberCount: members?.length || 0,
              members: members?.map(m => ({
                userId: m.id,
                user: {
                  name: m.name,
                  avatarUrl: m.avatar_url,
                }
              })) || [],
            };
          })
        );

        return NextResponse.json({ data: formattedConversations });
      }

      case 'get-messages': {
        const conversationId = searchParams.get('conversationId');
        const limit = parseInt(searchParams.get('limit') || '50');
        
        if (!conversationId) {
          return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversationid', conversationId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!messages) {
          return NextResponse.json({ data: [] });
        }

        const formattedMessages = await Promise.all(
          messages.map(async (msg) => {
            const { data: sender } = await supabase
              .from('users')
              .select('id, name, avatar_url')
              .eq('id', msg.senderid)
              .single();

            let replyTo = null;
            if (msg.reply_toid) {
              const { data: replyMsg } = await supabase
                .from('chat_messages')
                .select('id, content, senderid')
                .eq('id', msg.reply_toid)
                .single();

              if (replyMsg) {
                const { data: replySender } = await supabase
                  .from('users')
                  .select('name')
                  .eq('id', replyMsg.senderid)
                  .single();

                replyTo = {
                  id: replyMsg.id,
                  content: replyMsg.content,
                  senderName: replySender?.name || 'Unknown',
                };
              }
            }

            return {
              id: msg.id,
              conversationid: msg.conversationid,
              organizationId: msg.organizationId,
              senderid: msg.senderid,
              type: msg.type,
              content: msg.content,
              attachments: msg.attachments,
              replyTo,
              replyToContent: msg.reply_to_content,
              replyToSenderName: msg.reply_to_sender_name,
              reactions: msg.reactions,
              mentionedUserids: msg.mentioned_userids,
              readBy: msg.read_by,
              poll: msg.poll,
              threadCount: msg.thread_count,
              threadLastAt: msg.thread_last_at,
              scheduledFor: msg.scheduled_for,
              isSent: msg.is_sent,
              linkPreview: msg.link_preview,
              parentMessageid: msg.parent_messageid,
              isEdited: msg.is_edited,
              editedAt: msg.edited_at,
              isDeleted: msg.is_deleted,
              deletedAt: msg.deleted_at,
              deletedForUsers: msg.deleted_for_users,
              isPinned: msg.is_pinned,
              pinnedBy: msg.pinned_by,
              pinnedAt: msg.pinned_at,
              callDuration: msg.call_duration,
              callType: msg.call_type,
              callStatus: msg.call_status,
              isServiceBroadcast: msg.is_service_broadcast,
              broadcastTitle: msg.broadcast_title,
              broadcastIcon: msg.broadcast_icon,
              createdAt: msg.created_at,
              sender: sender ? {
                id: sender.id,
                name: sender.name,
                avatarUrl: sender.avatar_url,
              } : null,
            };
          })
        );

        return NextResponse.json({ data: formattedMessages.reverse() });
      }

      case 'get-pinned-messages': {
        const conversationId = searchParams.get('conversationId');
        
        if (!conversationId) {
          return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversationid', conversationId)
          .eq('is_pinned', true)
          .eq('is_deleted', false)
          .order('pinned_at', { ascending: false });

        if (!messages) {
          return NextResponse.json({ data: [] });
        }

        const formattedMessages = await Promise.all(
          messages.map(async (msg) => {
            const { data: sender } = await supabase
              .from('users')
              .select('id, name, avatar_url')
              .eq('id', msg.senderid)
              .single();

            return {
              id: msg.id,
              conversationid: msg.conversationid,
              organizationId: msg.organizationId,
              senderid: msg.senderid,
              type: msg.type,
              content: msg.content,
              attachments: msg.attachments,
              reactions: msg.reactions,
              isPinned: msg.is_pinned,
              pinnedBy: msg.pinned_by,
              pinnedAt: msg.pinned_at,
              createdAt: msg.created_at,
              sender: sender ? {
                id: sender.id,
                name: sender.name,
                avatarUrl: sender.avatar_url,
              } : null,
            };
          })
        );

        return NextResponse.json({ data: formattedMessages });
      }

      case 'search-messages': {
        const conversationId = searchParams.get('conversationId');
        const query = searchParams.get('query');
        
        if (!conversationId || !query) {
          return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversationid', conversationId)
          .eq('is_deleted', false)
          .ilike('content', `%${query}%`)
          .order('created_at', { ascending: false });

        if (!messages) {
          return NextResponse.json({ data: [] });
        }

        const formattedMessages = await Promise.all(
          messages.map(async (msg) => {
            const { data: sender } = await supabase
              .from('users')
              .select('id, name, avatar_url')
              .eq('id', msg.senderid)
              .single();

            return {
              id: msg.id,
              conversationid: msg.conversationid,
              organizationId: msg.organizationId,
              senderid: msg.senderid,
              type: msg.type,
              content: msg.content,
              attachments: msg.attachments,
              reactions: msg.reactions,
              createdAt: msg.created_at,
              sender: sender ? {
                id: sender.id,
                name: sender.name,
                avatarUrl: sender.avatar_url,
              } : null,
            };
          })
        );

        return NextResponse.json({ data: formattedMessages });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Chat API Error]', error);
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
      case 'get-or-create-dm': {
        const { organizationId, currentUserId, targetUserId } = body;

        if (!organizationId || !currentUserId || !targetUserId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const dmKey = [currentUserId, targetUserId].sort().join('-');

        const { data: existingConv } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('organizationId', organizationId)
          .eq('type', 'direct')
          .eq('dm_key', dmKey)
          .single();

        if (existingConv) {
          return NextResponse.json({ data: existingConv });
        }

        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({
            organizationId: organizationId,
            type: 'direct',
            created_by: currentUserId,
            dm_key: dmKey,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: newConv });
      }

      case 'create-group': {
        const { organizationId, createdBy, name, memberIds, description } = body;

        if (!organizationId || !createdBy || !name) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({
            organizationId: organizationId,
            type: 'group',
            name,
            description: description || null,
            created_by: createdBy,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: newConv });
      }

      case 'add-member': {
        const { conversationId, userId } = body;

        if (!conversationId || !userId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'send-message': {
        const { conversationId, senderId, organizationId, type, content, attachments, replyToId, mentionedUserIds, audioDuration } = body;

        if (!conversationId || !senderId || !organizationId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let replyToData = {};
        if (replyToId) {
          const { data: replyMsg } = await supabase
            .from('chat_messages')
            .select('content, senderid')
            .eq('id', replyToId)
            .single();

          if (replyMsg) {
            const { data: replySender } = await supabase
              .from('users')
              .select('name')
              .eq('id', replyMsg.senderid)
              .single();

            replyToData = {
              reply_toid: replyToId,
              reply_to_content: replyMsg.content,
              reply_to_sender_name: replySender?.name || 'Unknown',
            };
          }
        }

        const { data: newMessage, error } = await supabase
          .from('chat_messages')
          .insert({
            conversationid: conversationId,
            organizationId: organizationId,
            senderid: senderId,
            type: type || 'text',
            content: content || '',
            attachments: attachments || null,
            ...replyToData,
            mentioned_userids: mentionedUserIds || null,
            call_duration: audioDuration || null,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await supabase
          .from('chat_conversations')
          .update({
            last_message_at: newMessage.created_at,
            last_message_text: content || (attachments ? 'Attachment' : ''),
            last_message_senderid: senderId,
          })
          .eq('id', conversationId);

        return NextResponse.json({ data: newMessage });
      }

      case 'mark-as-read': {
        const { conversationId, userId } = body;

        if (!conversationId || !userId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'set-typing': {
        const { conversationId, userId, organizationId, isTyping } = body;

        if (!conversationId || !userId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'delete-message': {
        const { messageId, conversationId, userId } = body;

        if (!messageId) {
          return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
        }

        const { error } = await supabase
          .from('chat_messages')
          .update({
            is_deleted: true,
            deleted_at: Date.now(),
            deleted_for_users: [userId],
          })
          .eq('id', messageId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'edit-message': {
        const { messageId, content } = body;

        if (!messageId || !content) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabase
          .from('chat_messages')
          .update({
            content,
            is_edited: true,
            edited_at: Date.now(),
          })
          .eq('id', messageId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'pin-message': {
        const { messageId, conversationId, userId } = body;

        if (!messageId || !conversationId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabase
          .from('chat_messages')
          .update({
            is_pinned: true,
            pinned_by: userId,
            pinned_at: Date.now(),
          })
          .eq('id', messageId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'unpin-message': {
        const { messageId } = body;

        if (!messageId) {
          return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
        }

        const { error } = await supabase
          .from('chat_messages')
          .update({
            is_pinned: false,
            pinned_by: null,
            pinned_at: null,
          })
          .eq('id', messageId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'react-to-message': {
        const { messageId, userId, reaction, reactionAction } = body;

        if (!messageId || !userId || !reaction) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: message } = await supabase
          .from('chat_messages')
          .select('reactions')
          .eq('id', messageId)
          .single();

        const reactions = (message?.reactions as Record<string, string[]> | null) || {};
        
        if (reactionAction === 'remove') {
          if (reactions[reaction]) {
            reactions[reaction] = reactions[reaction].filter((id: string) => id !== userId);
            if (reactions[reaction].length === 0) {
              delete reactions[reaction];
            }
          }
        } else {
          if (!reactions[reaction]) {
            reactions[reaction] = [];
          }
          if (!reactions[reaction].includes(userId)) {
            reactions[reaction].push(userId);
          }
        }

        const { error } = await supabase
          .from('chat_messages')
          .update({ reactions })
          .eq('id', messageId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'toggle-pin-conversation': {
        const { conversationId, userId } = body;

        if (!conversationId) {
          return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const { data: conv } = await supabase
          .from('chat_conversations')
          .select('is_pinned')
          .eq('id', conversationId)
          .single();

        const { error } = await supabase
          .from('chat_conversations')
          .update({
            is_pinned: !conv?.is_pinned,
          })
          .eq('id', conversationId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'toggle-archive-conversation': {
        const { conversationId } = body;

        if (!conversationId) {
          return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const { data: conv } = await supabase
          .from('chat_conversations')
          .select('is_archived')
          .eq('id', conversationId)
          .single();

        const { error } = await supabase
          .from('chat_conversations')
          .update({
            is_archived: !conv?.is_archived,
          })
          .eq('id', conversationId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'delete-conversation': {
        const { conversationId, userId } = body;

        if (!conversationId) {
          return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const { error } = await supabase
          .from('chat_conversations')
          .update({
            is_deleted: true,
            deleted_by: userId,
            deleted_at: Date.now(),
          })
          .eq('id', conversationId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'restore-conversation': {
        const { conversationId } = body;

        if (!conversationId) {
          return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const { error } = await supabase
          .from('chat_conversations')
          .update({
            is_deleted: false,
            deleted_by: null,
            deleted_at: null,
          })
          .eq('id', conversationId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      case 'schedule-message': {
        const { conversationId, senderId, organizationId, content, scheduledFor } = body;

        if (!conversationId || !senderId || !organizationId || !scheduledFor) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: newMessage, error } = await supabase
          .from('chat_messages')
          .insert({
            conversationid: conversationId,
            organizationId: organizationId,
            senderid: senderId,
            type: 'text',
            content,
            scheduled_for: scheduledFor,
            is_sent: false,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: newMessage });
      }

      case 'update-conversation': {
        const { conversationId, name, description, avatarUrl } = body;

        if (!conversationId) {
          return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const updateData: { name?: string; description?: string | null; avatar_url?: string | null } = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

        if (Object.keys(updateData).length === 0) {
          return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const { error } = await supabase
          .from('chat_conversations')
          .update(updateData)
          .eq('id', conversationId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { success: true } });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Chat API Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
