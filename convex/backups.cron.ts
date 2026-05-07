/**
 * Scheduled jobs for backup system
 * - Backup all Enterprise org employees every 6 hours
 * - Cleanup expired backups every hour
 */

import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'backup-all-enterprise-orgs',
  { hours: 6 },
  internal.backups.backupAllEnterpriseOrgs,
);

crons.interval(
  'cleanup-expired-backups',
  { hours: 1 },
  internal.backups.cleanupExpiredBackupsInternal,
);

export default crons;
