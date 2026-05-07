import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { withCsrfProtection } from '@/lib/csrf-middleware';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const POST = withCsrfProtection(async (req: Request) => {
  try {
    const { userId, backupId } = await req.json();

    if (!userId || !backupId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const requester = await convex.query(api.users.queries.getUserById, { userId });
    if (!requester || requester.role !== 'superadmin') {
      return NextResponse.json({ error: 'Only superadmins can restore backups' }, { status: 403 });
    }

    const result = await convex.mutation(api.backups.restoreEmployeeBackup, {
      backupId: backupId as Id<'employeeBackups'>,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Employee data restored successfully from backup.`,
        restoredAt: result.restoredAt,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Restore failed: Unknown error`,
      });
    }
  } catch (error) {
    console.error('Restore backup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to restore backup' },
      { status: 500 },
    );
  }
});
