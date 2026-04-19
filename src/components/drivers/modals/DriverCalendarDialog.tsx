/**
 * DriverCalendarDialog - Shows driver's weekly schedule with translations
 */

'use client';

import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DriverCalendar } from '../DriverCalendar';

interface DriverCalendarDialogProps {
  open: boolean;
  onClose: () => void;
  driverId: string | null;
  organizationId: string;
  role?: 'admin' | 'driver';
}

export function DriverCalendarDialog({
  open,
  onClose,
  driverId,
  organizationId,
  role,
}: DriverCalendarDialogProps) {
  const { t } = useTranslation();

  if (!driverId) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 py-4 sm:p-6 border-b">
          <DialogTitle>{t('driverCalendar.dialogTitle', 'Driver Schedule')}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          <DriverCalendar
            driverId={driverId}
            organizationId={organizationId}
            role={role}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
