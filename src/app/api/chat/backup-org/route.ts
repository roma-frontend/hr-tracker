import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { withCsrfProtection } from '@/lib/csrf-middleware';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const POST = withCsrfProtection(async (req: Request) => {
  try {
    const { userId, organizationId } = await req.json();

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const requester = await convex.query(api.users.queries.getUserById, { userId });
    if (!requester || requester.role !== 'superadmin') {
      return NextResponse.json({ error: 'Only superadmins can run backups' }, { status: 403 });
    }

    const org = await convex.query(api.organizations.getOrganizationById, {
      callerUserId: userId,
      organizationId: organizationId as Id<'organizations'>,
    });
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const result = await convex.mutation(api.backups.createOrgBackups, {
      organizationId: organizationId as Id<'organizations'>,
    });

    return NextResponse.json({
      success: result.success,
      message: `Backup started for ${org.name}. ${result.backedUp} employees queued for backup.`,
      backedUp: result.backedUp,
      failed: result.failed,
    });
  } catch (error) {
    console.error('Backup org error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start backup' },
      { status: 500 },
    );
  }
});
