/**
 * Driver Message Templates Component
 * Quick message templates for driver-passenger communication
 * Integrates with Team Chat for in-app messaging and calling
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { MessageSquare, Phone, PhoneCall, Video, Send, Navigation } from 'lucide-react';
import { CallModal } from '@/components/chat/CallModal';
import type { ActiveCall } from '@/components/chat/ChatClient';

interface MessageTemplatesProps {
  passengerName?: string;
  passengerPhone?: string;
  passengerUserId?: Id<'users'>;
  driverUserId?: Id<'users'>;
  driverName?: string;
  driverAvatar?: string;
  organizationId?: Id<'organizations'>;
  tripInfo?: {
    from: string;
    to: string;
    purpose: string;
  };
  onSendMessage?: (message: string) => void;
}

const TEMPLATES = [
  {
    id: 'arrived',
    label: "I've Arrived",
    message: "Hi! I've arrived at the pickup location. Ready when you are! 🚗",
  },
  {
    id: 'delayed',
    label: 'Running Late',
    message:
      "Hi! I'm running about 5 minutes late due to traffic. Apologies for the inconvenience! ⏰",
  },
  {
    id: 'waiting',
    label: 'Waiting',
    message: "Hi! I'm waiting at the pickup point. Please let me know when you're ready. 👋",
  },
  {
    id: 'confirming',
    label: 'Confirming Trip',
    message: 'Hi! Confirming your trip from {from} to {to}. See you soon! ✅',
  },
  {
    id: 'completed',
    label: 'Trip Completed',
    message:
      'Thank you for choosing our service! Hope you had a great trip. Please rate your experience. ⭐',
  },
  {
    id: 'cant_find',
    label: "Can't Find Location",
    message: "Hi! I'm having trouble finding the pickup location. Can you provide more details? 📍",
  },
  {
    id: 'calling',
    label: 'Request Call',
    message: "Hi! I'm calling you now to confirm the pickup details. 📞",
  },
];

export function MessageTemplates({
  passengerName,
  passengerPhone,
  passengerUserId,
  driverUserId,
  driverName,
  driverAvatar,
  organizationId,
  tripInfo,
  onSendMessage,
}: MessageTemplatesProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [calling, setCalling] = useState(false);

  const getOrCreateDM = useMutation(api.chat.getOrCreateDM);
  const sendChatMessage = useMutation(api.chat.sendMessage);
  const initiateCallMutation = useMutation(api.chat.initiateCall);

  const canUseChat = !!(passengerUserId && driverUserId && organizationId);

  const sendViaChatMessage = useCallback(
    async (message: string) => {
      if (!canUseChat) return false;
      try {
        const conversationId = await getOrCreateDM({
          organizationId: organizationId!,
          currentUserId: driverUserId!,
          targetUserId: passengerUserId!,
        });
        await sendChatMessage({
          conversationId,
          senderId: driverUserId!,
          organizationId: organizationId!,
          type: 'text',
          content: message,
        });
        return true;
      } catch (error: any) {
        console.error('Failed to send chat message:', error);
        return false;
      }
    },
    [canUseChat, getOrCreateDM, sendChatMessage, organizationId, driverUserId, passengerUserId],
  );

  const handleSendMessage = async (template: (typeof TEMPLATES)[0]) => {
    let message = template.message;

    // Replace placeholders
    if (tripInfo) {
      message = message.replace('{from}', tripInfo.from);
      message = message.replace('{to}', tripInfo.to);
    }

    if (passengerName) {
      message = message.replace('Hi!', `Hi ${passengerName}!`);
    }

    if (onSendMessage) {
      onSendMessage(message);
      setOpen(false);
      return;
    }

    // Try sending via Team Chat
    if (canUseChat) {
      const sent = await sendViaChatMessage(message);
      if (sent) {
        toast.success('Message sent via Team Chat');
        setOpen(false);
        return;
      }
    }

    // Fallback: copy to clipboard
    navigator.clipboard.writeText(message);
    toast.success('Message copied to clipboard');
    setOpen(false);
  };

  const handleCall = useCallback(async () => {
    // Try in-app call via Team Chat first
    if (canUseChat && !calling) {
      setCalling(true);
      try {
        const conversationId = await getOrCreateDM({
          organizationId: organizationId!,
          currentUserId: driverUserId!,
          targetUserId: passengerUserId!,
        });
        const callId = await initiateCallMutation({
          conversationId,
          organizationId: organizationId!,
          initiatorId: driverUserId!,
          type: 'audio',
          participantIds: [driverUserId!, passengerUserId!],
        });
        setActiveCall({
          callId,
          conversationId,
          type: 'audio',
          isInitiator: true,
          remoteUserId: passengerUserId,
          remoteUserName: passengerName,
        });
      } catch (error: any) {
        console.error('Failed to initiate call:', error);
        // Fallback to tel: link
        if (passengerPhone) {
          window.open(`tel:${passengerPhone}`);
        } else {
          toast.error('Failed to start call');
        }
      } finally {
        setCalling(false);
      }
      return;
    }

    // Fallback: tel: protocol
    if (passengerPhone) {
      window.open(`tel:${passengerPhone}`);
    } else {
      toast.error('No phone number available');
    }
  }, [
    canUseChat,
    calling,
    getOrCreateDM,
    initiateCallMutation,
    organizationId,
    driverUserId,
    passengerUserId,
    passengerName,
    passengerPhone,
  ]);

  const handleEndCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Quick Messages</span>
              <span className="sm:hidden">Message</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            {TEMPLATES.map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => handleSendMessage(template)}
                className="flex flex-col items-start gap-1 py-3"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium">{template.label}</span>
                  {canUseChat && <Send className="w-3 h-3 text-blue-500 ml-auto" />}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {template.message}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm"
          onClick={handleCall}
          disabled={calling}
        >
          <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Call
        </Button>
      </div>

      {/* In-app Call Modal */}
      {activeCall && driverUserId && (
        <CallModal
          call={activeCall}
          currentUserId={driverUserId}
          currentUserName={driverName || 'Driver'}
          currentUserAvatar={driverAvatar}
          onEnd={handleEndCall}
        />
      )}
    </>
  );
}
