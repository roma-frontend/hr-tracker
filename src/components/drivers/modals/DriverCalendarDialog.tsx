/**
 * DriverCalendarDialog - Shows driver's weekly schedule with translations
 */

'use client';

import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DriverCalendar } from '../DriverCalendar';
import type { Id } from '@/convex/_generated/dataModel';

interface DriverCalendarDialogProps {
  open: boolean;
  onClose: () => void;
  driverId: string | null;
  organizationId: Id<'organizations'>;
}

export function DriverCalendarDialog({
  open,
  onClose,
  driverId,
  organizationId,
}: DriverCalendarDialogProps) {
  const { t } = useTranslation();

  if (!driverId) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('driverCalendar.dialogTitle', 'Driver Schedule')}</DialogTitle>
        </DialogHeader>
        <DriverCalendar driverId={driverId as Id<'drivers'>} organizationId={organizationId} />
      </DialogContent>
    </Dialog>
  );
}
