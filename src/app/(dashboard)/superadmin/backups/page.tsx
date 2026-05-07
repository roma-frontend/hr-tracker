'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldLoader } from '@/components/ui/ShieldLoader';
import {
  Database,
  HardDrive,
  Clock,
  Building2,
  RotateCcw,
  ShieldAlert,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  FileBox,
  Building,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useSelectedOrganization } from '@/hooks/useSelectedOrganization';
import type { Id } from '@/convex/_generated/dataModel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SUPERADMIN_EMAIL = 'romangulanyan@gmail.com';

export default function BackupsManagementPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const globalSelectedOrgId = useSelectedOrganization();

  const backupStats = useQuery(api.backups.getBackupStats);
  const allOrganizations = useQuery(
    api.organizations.getAllOrganizations,
    user?.id ? { superadminUserId: user.id as Id<'users'> } : 'skip',
  );

  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [expandedEmployees, setExpandedEmployees] = useState<Map<string, string>>(new Map());
  const [restoreConfirm, setRestoreConfirm] = useState<{
    backupId: Id<'employeeBackups'>;
    userName: string;
    userEmail: string;
    createdAt: number;
  } | null>(null);

  const restoreEmployeeBackup = useMutation(api.backups.restoreEmployeeBackup);
  const createOrgBackups = useMutation(api.backups.createOrgBackups);
  const [runningBackup, setRunningBackup] = useState<string | null>(null);
  const [localSelectedOrg, setLocalSelectedOrg] = useState<{ id: string; name: string } | null>(
    null,
  );

  const enterpriseOrgs = allOrganizations?.filter((org: any) => org.plan === 'enterprise') ?? [];

  const defaultOrgId =
    globalSelectedOrgId && enterpriseOrgs.some((o: any) => o._id === globalSelectedOrgId)
      ? globalSelectedOrgId
      : null;

  const effectiveOrgId = localSelectedOrg?.id ?? defaultOrgId;

  const filteredOrgs = useMemo(() => {
    if (!effectiveOrgId) return enterpriseOrgs;
    return enterpriseOrgs.filter((org: any) => org._id === effectiveOrgId);
  }, [enterpriseOrgs, effectiveOrgId]);

  const selectedOrgData = useMemo(() => {
    if (!effectiveOrgId) return null;
    return enterpriseOrgs.find((org: any) => org._id === effectiveOrgId) ?? null;
  }, [enterpriseOrgs, effectiveOrgId]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ShieldLoader size="lg" />
      </div>
    );
  }

  const isSuperAdmin = user.role === 'superadmin' || user.email?.toLowerCase() === SUPERADMIN_EMAIL;

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-500">
              <ShieldAlert className="w-6 h-6" />
              <CardTitle>{t('superadmin.backups.accessDenied')}</CardTitle>
            </div>
            <CardDescription>{t('ui.onlySuperadminCanAccess')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('superadmin.backups.accessDenied')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleOrg = (orgId: string) => {
    setExpandedOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(orgId)) {
        next.delete(orgId);
      } else {
        next.add(orgId);
      }
      return next;
    });
  };

  const toggleEmployee = (orgId: string, userId: string) => {
    const key = `${orgId}:${userId}`;
    setExpandedEmployees((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, userId);
      }
      return next;
    });
  };

  const handleRestore = (
    backupId: Id<'employeeBackups'>,
    userName: string,
    userEmail: string,
    createdAt: number,
  ) => {
    setRestoreConfirm({ backupId, userName, userEmail, createdAt });
  };

  const handleManualBackup = async (orgId: string, orgName: string) => {
    setRunningBackup(orgId);
    try {
      const result = await createOrgBackups({ organizationId: orgId as Id<'organizations'> });
      if (result.success) {
        toast.success(
          t('superadmin.backups.manualBackupSuccess', { name: orgName, count: result.backedUp }),
        );
      } else {
        toast.error(t('superadmin.backups.manualBackupFailed', { reason: result.reason }));
      }
    } catch (error) {
      toast.error(t('superadmin.backups.manualBackupError'));
    } finally {
      setRunningBackup(null);
    }
  };

  const handleSingleOrgBackup = async () => {
    if (!effectiveOrgId || !selectedOrgData) return;
    await handleManualBackup(selectedOrgData._id, selectedOrgData.name);
  };

  const confirmRestore = async () => {
    if (!restoreConfirm) return;

    try {
      const result = await restoreEmployeeBackup({ backupId: restoreConfirm.backupId });
      if (result.success) {
        toast.success(t('superadmin.backups.restoreSuccess', { name: restoreConfirm.userName }));
      } else {
        toast.error(t('superadmin.backups.restoreError'));
      }
    } catch (error) {
      toast.error(t('superadmin.backups.restoreError'));
    }

    setRestoreConfirm(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(
      i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'hy' ? 'hy-AM' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  const handleRunAllBackups = async () => {
    setRunningBackup('all');
    try {
      let totalBackedUp = 0;
      let totalFailed = 0;

      for (const org of enterpriseOrgs) {
        try {
          const result = await createOrgBackups({ organizationId: org._id as Id<'organizations'> });
          if (result.success) {
            totalBackedUp += result.backedUp || 0;
            totalFailed += result.failed || 0;
          }
        } catch {
          totalFailed += org.totalEmployees || 1;
        }
      }

      if (totalBackedUp > 0) {
        toast.success(t('superadmin.backups.manualBackupSuccess', { count: totalBackedUp }));
      }
      if (totalFailed > 0) {
        toast.warning(t('superadmin.backups.manualBackupPartial', { count: totalFailed }));
      }
    } catch (error) {
      toast.error(t('superadmin.backups.manualBackupError'));
    } finally {
      setRunningBackup(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-4 bg-(--background)/95 backdrop-blur supports-[backdrop-filter]:bg-(--background)/60 border-b border-(--border)">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-(--text-primary)">
              {t('superadmin.backups.title')}
            </h1>
            <p className="text-sm md:text-base text-(--text-muted) mt-1">
              {t('superadmin.backups.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!allOrganizations || enterpriseOrgs.length === 0}
                  className="flex items-center gap-2 border-(--border) text-(--text-primary) hover:bg-(--background-subtle) disabled:opacity-50"
                >
                  <Building className="w-4 h-4" />
                  {selectedOrgData?.name ??
                    (globalSelectedOrgId
                      ? (enterpriseOrgs.find((o: any) => o._id === globalSelectedOrgId)?.name ??
                        t('superadmin.backups.selectOrg'))
                      : t('superadmin.backups.selectOrg'))}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                <DropdownMenuLabel>{t('superadmin.backups.selectOrgLabel')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {enterpriseOrgs.map((org: any) => (
                  <DropdownMenuItem
                    key={org._id}
                    onClick={() => setLocalSelectedOrg({ id: org._id, name: org.name })}
                    className={effectiveOrgId === org._id ? 'bg-(--primary)/10' : ''}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    {org.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={handleSingleOrgBackup}
              disabled={!allOrganizations || !!runningBackup || !effectiveOrgId}
              className="flex items-center gap-2 bg-(--accent) text-white hover:bg-(--accent)/90 disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              {runningBackup === effectiveOrgId
                ? t('superadmin.backups.runningBackup')
                : t('superadmin.backups.backupSelectedOrg')}
            </Button>
            <Button
              onClick={handleRunAllBackups}
              disabled={!allOrganizations || !!runningBackup || enterpriseOrgs.length === 0}
              className="flex items-center gap-2 bg-(--primary) text-white hover:bg-(--primary)/90 disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              {runningBackup
                ? t('superadmin.backups.runningBackup')
                : t('superadmin.backups.runAllBackups')}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-(--card)">
          <CardHeader className="pb-2">
            <CardDescription>{t('superadmin.backups.totalBackups')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-(--primary)/10">
                <Database className="w-5 h-5 text-(--primary)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--text-primary)">
                  {backupStats?.totalBackups ?? '...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-(--card)">
          <CardHeader className="pb-2">
            <CardDescription>{t('superadmin.backups.storageUsed')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-(--primary)/10">
                <HardDrive className="w-5 h-5 text-(--primary)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--text-primary)">
                  {backupStats ? formatSize(backupStats.totalSize) : '...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-(--card)">
          <CardHeader className="pb-2">
            <CardDescription>{t('superadmin.backups.orgsBackedUp')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-(--primary)/10">
                <Building2 className="w-5 h-5 text-(--primary)" />
              </div>
              <div>
                <p className="text-2xl font-bold text-(--text-primary)">
                  {backupStats?.orgsBackedUp ?? '...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations List */}
      <Card className="bg-(--card)">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {t('superadmin.backups.orgBackupsTitle')}
          </CardTitle>
          <CardDescription>
            {filteredOrgs.length} {t('superadmin.backups.enterpriseOrgs')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!allOrganizations ? (
            <div className="flex items-center justify-center py-8">
              <ShieldLoader size="sm" />
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="text-center py-8 text-(--text-muted)">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t('superadmin.backups.noOrgsFound')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOrgs.map((org: any) => (
                <OrgBackups
                  key={org._id}
                  org={org}
                  isExpanded={expandedOrgs.has(org._id)}
                  onToggle={() => toggleOrg(org._id)}
                  expandedEmployees={expandedEmployees}
                  onToggleEmployee={toggleEmployee}
                  onRestore={handleRestore}
                  onManualBackup={handleManualBackup}
                  runningBackup={runningBackup}
                  formatSize={formatSize}
                  formatDate={formatDate}
                  t={t}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      {restoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 bg-(--card) border-(--border)">
            <CardHeader>
              <div className="flex items-center gap-2 text-amber-500">
                <AlertCircle className="w-5 h-5" />
                <CardTitle>{t('superadmin.backups.restoreConfirmTitle')}</CardTitle>
              </div>
              <CardDescription>
                {t('superadmin.backups.restoreConfirmDesc', {
                  userName: restoreConfirm.userName,
                  date: formatDate(restoreConfirm.createdAt),
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-(--background-subtle) p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-(--text-muted)">{t('superadmin.user')}</span>
                  <span className="text-(--text-primary) font-medium">
                    {restoreConfirm.userName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--text-muted)">{t('superadmin.email')}</span>
                  <span className="text-(--text-primary)">{restoreConfirm.userEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--text-muted)">{t('superadmin.backups.backupDate')}</span>
                  <span className="text-(--text-primary)">
                    {formatDate(restoreConfirm.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setRestoreConfirm(null)}
                  className="border-(--border) text-(--text-primary)"
                >
                  {t('superadmin.backups.cancelBtn')}
                </Button>
                <Button
                  onClick={confirmRestore}
                  className="bg-(--primary) text-white hover:bg-(--primary)/90"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  {t('superadmin.backups.restoreConfirmBtn')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function OrgBackups({
  org,
  isExpanded,
  onToggle,
  expandedEmployees,
  onToggleEmployee,
  onRestore,
  onManualBackup,
  runningBackup,
  formatSize,
  formatDate,
  t,
}: {
  org: any;
  isExpanded: boolean;
  onToggle: () => void;
  expandedEmployees: Map<string, string>;
  onToggleEmployee: (orgId: string, userId: string) => void;
  onRestore: (
    backupId: Id<'employeeBackups'>,
    userName: string,
    userEmail: string,
    createdAt: number,
  ) => void;
  onManualBackup: (orgId: string, orgName: string) => void;
  runningBackup: string | null;
  formatSize: (bytes: number) => string;
  formatDate: (timestamp: number) => string;
  t: (key: string, params?: Record<string, any>) => string;
}) {
  const orgBackups = useQuery(
    api.backups.getOrgBackups,
    isExpanded ? { organizationId: org._id as Id<'organizations'> } : 'skip',
  );

  return (
    <div className="border border-(--border) rounded-lg overflow-hidden">
      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between p-4 hover:bg-(--background-subtle) transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-(--text-muted)" />
            ) : (
              <ChevronRight className="w-4 h-4 text-(--text-muted)" />
            )}
            <div>
              <p className="font-medium text-(--text-primary)">{org.name}</p>
              <p className="text-xs text-(--text-muted)">{org.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-(--text-muted)">
              <Database className="w-3 h-3" />
              <span>{orgBackups?.reduce((sum, emp) => sum + emp.backupCount, 0) ?? 0}</span>
            </div>
            {orgBackups && orgBackups.length > 0 && (
              <div className="flex items-center gap-1 text-(--text-muted)">
                <Clock className="w-3 h-3" />
                <span>{formatDate(Math.max(...orgBackups.map((e: any) => e.latestBackup)))}</span>
              </div>
            )}
          </div>
        </button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onManualBackup(org._id, org.name);
          }}
          disabled={runningBackup === org._id || runningBackup === 'all'}
          variant="ghost"
          size="sm"
          className="mr-2 text-(--primary) hover:text-(--primary) hover:bg-(--primary)/10 disabled:opacity-50"
        >
          {runningBackup === org._id ? (
            <ShieldLoader size="xs" variant="inline" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          <span className="ml-1 text-xs">{t('superadmin.backups.backupOrg')}</span>
        </Button>
      </div>

      {isExpanded && orgBackups && (
        <div className="border-t border-(--border) bg-(--background-subtle)">
          {orgBackups.length === 0 ? (
            <div className="p-6 text-center text-(--text-muted)">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('superadmin.backups.noBackupsForUser')}</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {orgBackups.map((emp: any) => {
                const empKey = `${org._id}:${emp.userId}`;
                const isEmpExpanded = expandedEmployees.has(empKey);
                return (
                  <EmployeeBackups
                    key={emp.userId}
                    emp={emp}
                    orgId={org._id}
                    isExpanded={isEmpExpanded}
                    onToggle={() => onToggleEmployee(org._id, emp.userId)}
                    onRestore={onRestore}
                    formatSize={formatSize}
                    formatDate={formatDate}
                    t={t}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmployeeBackups({
  emp,
  orgId,
  isExpanded,
  onToggle,
  onRestore,
  formatSize,
  formatDate,
  t,
}: {
  emp: any;
  orgId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onRestore: (
    backupId: Id<'employeeBackups'>,
    userName: string,
    userEmail: string,
    createdAt: number,
  ) => void;
  formatSize: (bytes: number) => string;
  formatDate: (timestamp: number) => string;
  t: (key: string, params?: Record<string, any>) => string;
}) {
  const userBackups = useQuery(
    api.backups.getUserBackups,
    isExpanded
      ? { organizationId: orgId as Id<'organizations'>, userId: emp.userId as Id<'users'> }
      : 'skip',
  );

  return (
    <div className="border border-(--border) rounded-lg overflow-hidden bg-(--card)">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-(--background-subtle) transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-(--text-muted)" />
          ) : (
            <ChevronRight className="w-3 h-3 text-(--text-muted)" />
          )}
          <User className="w-4 h-4 text-(--text-muted)" />
          <div>
            <p className="font-medium text-(--text-primary) text-sm">{emp.userName}</p>
            <p className="text-xs text-(--text-muted)">{emp.userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Badge
            variant="outline"
            className="bg-(--primary)/10 text-(--primary) border-(--primary)/20"
          >
            {emp.backupCount}{' '}
            {t('superadmin.backups.employeeBackupsCount', { count: emp.backupCount })}
          </Badge>
          <div className="flex items-center gap-1 text-(--text-muted)">
            <Calendar className="w-3 h-3" />
            {formatDate(emp.latestBackup)}
          </div>
        </div>
      </button>

      {isExpanded && userBackups && (
        <div className="border-t border-(--border) bg-(--background-subtle)">
          {userBackups.length === 0 ? (
            <div className="p-4 text-center text-(--text-muted) text-sm">
              {t('superadmin.backups.noBackupsForUser')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-(--border)">
                    <th className="text-left py-2 px-4 text-(--text-muted) font-semibold text-xs">
                      {t('superadmin.backups.backupDate')}
                    </th>
                    <th className="text-left py-2 px-4 text-(--text-muted) font-semibold text-xs">
                      {t('superadmin.backups.backupExpires')}
                    </th>
                    <th className="text-left py-2 px-4 text-(--text-muted) font-semibold text-xs">
                      {t('superadmin.backups.backupSize')}
                    </th>
                    <th className="text-left py-2 px-4 text-(--text-muted) font-semibold text-xs">
                      {t('superadmin.backups.status')}
                    </th>
                    <th className="text-left py-2 px-4 text-(--text-muted) font-semibold text-xs">
                      {t('superadmin.backups.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userBackups.map((backup: any) => {
                    const now = Date.now();
                    const isExpired = backup.expiresAt < now;
                    return (
                      <tr
                        key={backup.id}
                        className="border-b border-(--border) hover:bg-(--background-subtle) transition-colors"
                      >
                        <td className="py-2 px-4 text-sm text-(--text-primary)">
                          {formatDate(backup.createdAt)}
                        </td>
                        <td className="py-2 px-4 text-sm text-(--text-muted)">
                          {formatDate(backup.expiresAt)}
                        </td>
                        <td className="py-2 px-4 text-sm text-(--text-primary)">
                          {formatSize(backup.snapshotSize)}
                        </td>
                        <td className="py-2 px-4">
                          <Badge
                            variant="outline"
                            className={
                              isExpired
                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                : 'bg-green-500/10 text-green-500 border-green-500/20'
                            }
                          >
                            {isExpired
                              ? t('superadmin.backups.expired')
                              : t('superadmin.backups.active')}
                          </Badge>
                        </td>
                        <td className="py-2 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isExpired}
                            onClick={() =>
                              onRestore(
                                backup.id,
                                backup.userName,
                                backup.userEmail,
                                backup.createdAt,
                              )
                            }
                            className="text-(--primary) hover:text-(--primary) hover:bg-(--primary)/10 disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            {t('superadmin.backups.restoreEmployee')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
