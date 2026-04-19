/**
 * Driver Message Templates Component
 * Quick message templates for driver-passenger communication
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { MessageSquare, PhoneCall } from 'lucide-react';

interface MessageTemplatesProps {
  passengerName?: string;
  passengerPhone?: string;
  passengerUserId?: string;
  driverUserId?: string;
  driverName?: string;
  driverAvatar?: string;
  organizationId?: string;
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
    labelKey: 'messageTemplates.arrivedLabel',
    messageKey: 'messageTemplates.arrivedMessage',
  },
  {
    id: 'delayed',
    labelKey: 'messageTemplates.runningLateLabel',
    messageKey: 'messageTemplates.runningLateMessage',
  },
  {
    id: 'waiting',
    labelKey: 'messageTemplates.waitingLabel',
    messageKey: 'messageTemplates.waitingMessage',
  },
  {
    id: 'confirming',
    labelKey: 'messageTemplates.confirmingTripLabel',
    messageKey: 'messageTemplates.confirmingTripMessage',
  },
  {
    id: 'completed',
    labelKey: 'messageTemplates.tripCompletedLabel',
    messageKey: 'messageTemplates.tripCompletedMessage',
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

  const handleSendMessage = async (template: (typeof TEMPLATES)[0]) => {
    let message = t(template.messageKey);

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

    navigator.clipboard.writeText(message);
    toast.success(t('errors.messageCopied'));
    setOpen(false);
  };

  const handleCall = useCallback(() => {
    if (passengerPhone) {
      window.open(`tel:${passengerPhone}`);
    } else {
      toast.error(t('errors.noPhoneAvailable'));
    }
  }, [passengerPhone]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">
                {t('messageTemplates.quickMessages')}
              </span>
              <span className="sm:hidden">{t('messageTemplates.message')}</span>
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
                  <span className="font-medium">{t(template.labelKey)}</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {t(template.messageKey)}
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
        >
          <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          {t('messageTemplates.call')}
        </Button>
      </div>
    </>
  );
}
