'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from '@/lib/cssMotion';
import { UserCheck, UserX, Clock, Mail, Calendar, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSelectedOrganization } from '@/hooks/useSelectedOrganization';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldLoader } from '@/components/ui/ShieldLoader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { usePendingApprovals, useApproveUser, useRejectUser } from '@/hooks/useApprovals';

export default function ApprovalsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const selectedOrgId = useSelectedOrganization();
  const isSuperadmin = user?.role === 'superadmin';
  const _effectiveOrgId = isSuperadmin && selectedOrgId ? selectedOrgId : user?.organizationId;

  const { data: pendingUsers, isLoading } = usePendingApprovals();
  const approveUserMutation = useApproveUser();
  const rejectUserMutation = useRejectUser();

  const handleApprove = async (userId: string, userName: string) => {
    if (!user?.id) {
      toast.error(t('ui.pleaseLoginAgain'));
      return;
    }
    await approveUserMutation.mutateAsync(userId);
    toast.success(t('ui.userApproved', { name: userName }));
  };

  const handleReject = async (userId: string, userName: string) => {
    if (!user?.id) return;
    const message = t('ui.confirmRejectUser', { name: userName });
    if (!confirm(message)) return;
    await rejectUserMutation.mutateAsync(userId);
    toast.success(t('ui.userRejected', { name: userName }));
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <UserX className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-(--text-primary)">{t('ui.accessDenied')}</h2>
        <p className="text-(--text-muted) text-sm">{t('ui.onlyAdminsCanAccess')}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-6 bg-(--background)/95 backdrop-blur supports-[backdrop-filter]:bg-(--background)/60 border-b border-(--border)">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--text-primary)">
            {t('ui.userApprovals')}
          </h2>
          <p className="text-(--text-muted) text-sm mt-1">{t('ui.approvalsPageDescription')}</p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShieldLoader size="sm" />
          </CardContent>
        </Card>
      ) : pendingUsers && pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-semibold text-(--text-primary) mb-1">
              {t('ui.allCaughtUp')}
            </h3>
            <p className="text-sm text-(--text-muted)">{t('ui.noPendingApprovals')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {pendingUsers?.map((pendingUser) => (
            <Card key={pendingUser.id}>
              <CardHeader className="pb-3 p-4 sm:p-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-linear-to-br from-[#2563eb] to-[#0ea5e9] flex items-center justify-center text-white font-bold text-sm sm:text-lg shrink-0">
                    {pendingUser.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pendingUser.avatarUrl}
                        alt={pendingUser.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      pendingUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm sm:text-base truncate">
                          {pendingUser.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{pendingUser.email}</span>
                        </CardDescription>
                      </div>
                      <Badge variant="warning" className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        <span className="hidden sm:inline">{t('ui.pending')}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-(--text-muted) text-[10px] sm:text-xs">{t('labels.role')}</p>
                    <p className="text-(--text-primary) font-medium capitalize">
                      {pendingUser.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-(--text-muted) text-[10px] sm:text-xs">{t('labels.type')}</p>
                    <p className="text-(--text-primary) font-medium capitalize">
                      {pendingUser.employeeType}
                    </p>
                  </div>
                  <div>
                    <p className="text-(--text-muted) text-[10px] sm:text-xs">
                      {t('labels.registered')}
                    </p>
                    <p className="text-(--text-primary) font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {format(new Date(pendingUser.createdAt), 'MMM d, yyyy')}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-(--text-muted) text-[10px] sm:text-xs">
                      {t('employeeInfo.phone')}
                    </p>
                    <p className="text-(--text-primary) font-medium">{pendingUser.phone ?? '—'}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-(--border)">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(pendingUser.id, pendingUser.name)}
                    disabled={approveUserMutation.isPending}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {approveUserMutation.isPending ? t('common.approving', 'Approving...') : t('ui.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(pendingUser.id, pendingUser.name)}
                    disabled={rejectUserMutation.isPending}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <UserX className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {rejectUserMutation.isPending ? t('common.rejecting', 'Rejecting...') : t('ui.reject')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}