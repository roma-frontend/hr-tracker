"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShieldLoader } from "@/components/ui/ShieldLoader";
import {
  Users,
  Plus,
  CreditCard,
  Calendar,
  DollarSign,
  Shield,
  X,
  CheckCircle,
  AlertCircle,
  ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthStore } from "@/store/useAuthStore";
import { CreateManualSubscriptionWizard } from "@/components/superadmin/CreateManualSubscriptionWizard";

const SUPERADMIN_EMAIL = "romangulanyan@gmail.com";

export default function SubscriptionsManagementPage() {
  const { t } = useTranslation();
  const subscriptions = useQuery(api.subscriptions_admin.listAllWithUsers);

  // Get current user from useAuthStore (works with both email/password and OAuth)
  const { user } = useAuthStore();

  const allOrganizations = useQuery(
    api.organizations.getAllOrganizations,
    user?.id ? { superadminUserId: user.id as any } : "skip"
  );

  const createManual = useMutation(api.subscriptions_admin.createManualSubscription);
  const cancelSub = useMutation(api.subscriptions_admin.cancelSubscription);

  const [showForm, setShowForm] = useState(false);

  // Wait for user to load - MUST check this first before checking role
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ShieldLoader size="lg" />
      </div>
    );
  }

  // Check if user is superadmin - only after user is loaded
  const isSuperAdmin = user.role === "superadmin" || user.email?.toLowerCase() === SUPERADMIN_EMAIL;

  // If not superadmin, show access denied
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-500">
              <ShieldAlert className="w-6 h-6" />
              <CardTitle>{t('superadmin.subscriptions.accessDenied')}</CardTitle>
            </div>
            <CardDescription>
              {t('ui.onlySuperadminCanAccess')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('superadmin.subscriptions.accessDenied')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCancel = async (subId: Id<"subscriptions">) => {
    if (!confirm(t('superadmin.subscriptions.confirmCancelSub'))) return;

    try {
      await cancelSub({ subscriptionId: subId });
      toast.success(t('superadmin.subscriptions.cancelSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('superadmin.subscriptions.failedToCancel'));
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      canceled: "bg-red-500/10 text-red-500 border-red-500/20",
      trialing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      past_due: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };

    return (
      <Badge variant="outline" className={colors[status] || ""}>
        {status === "active" && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === "canceled" && <X className="w-3 h-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{t('superadmin.subscriptions.title')}</h1>
          <p className="text-sm md:text-base text-[var(--text-muted)] mt-1">{t('superadmin.subscriptions.subtitle')}</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          {showForm ? t('superadmin.subscriptions.cancelButtonText') : t('superadmin.subscriptions.addManualSubscription')}
        </Button>
      </div>

      {/* Create Manual Subscription Form - Using Wizard */}
      {showForm && (
        <Card className="border-[var(--primary)]/20 bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--primary)]" />
              {t('superadmin.subscriptions.createManualSubscription')}
            </CardTitle>
            <CardDescription>
              {t('superadmin.subscriptions.createManualSubDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateManualSubscriptionWizard
              onComplete={() => {
                setShowForm(false);
                toast.success(t('superadmin.subscriptions.createSuccess'));
              }}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Subscriptions List */}
      <Card className="bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('superadmin.subscriptions.allSubscriptions')}
          </CardTitle>
          <CardDescription>{subscriptions?.length || 0}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-2 text-[var(--text-muted)] font-semibold">{t('superadmin.subscriptions.organization')}</th>
                  <th className="text-left py-3 px-2 text-[var(--text-muted)] font-semibold">{t('superadmin.subscriptions.employees')}</th>
                  <th className="text-left py-3 px-2 text-[var(--text-muted)] font-semibold">{t('superadmin.subscriptions.plan')}</th>
                  <th className="text-left py-3 px-2 text-[var(--text-muted)] font-semibold">{t('superadmin.subscriptions.status')}</th>
                  <th className="text-left py-3 px-2 text-[var(--text-muted)] font-semibold">{t('superadmin.subscriptions.type')}</th>
                  <th className="text-left py-3 px-2 text-[var(--text-muted)] font-semibold">{t('superadmin.subscriptions.price')}</th>
                  <th className="text-left py-3 px-2 text-[var(--text-muted)] font-semibold">{t('superadmin.subscriptions.expires')}</th>
                  <th className="text-left py-3 px-2 text-[var(--text-muted)] font-semibold">{t('superadmin.subscriptions.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions?.map((sub: any) => (
                  <tr key={sub._id} className="border-b border-[var(--border)] hover:bg-[var(--background-subtle)] transition-colors">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{sub.organizationName || "Unknown"}</p>
                        <p className="text-xs text-[var(--text-muted)]">{sub.organizationSlug}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 text-[var(--text-muted)]">
                        <Users className="w-3 h-3" />
                        <span>{sub.employeeCount || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="capitalize font-semibold text-[var(--text-primary)]">
                        {sub.plan === "enterprise" && "🏢 "}
                        {sub.plan === "professional" && "💼 "}
                        {sub.plan === "starter" && "⚡ "}
                        {sub.plan}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="py-3 px-2">
                      {sub.isManual ? (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                          {t('superadmin.subscriptions.manual')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          {t('superadmin.subscriptions.stripe')}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-2 text-[var(--text-primary)]">
                      ${(sub as any).metadata?.customPrice || (sub.plan === "professional" ? "49" : sub.plan === "enterprise" ? "Custom" : "0")}
                    </td>
                    <td className="py-3 px-2 text-[var(--text-muted)] text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(sub.currentPeriodEnd ?? 0).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {sub.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(sub._id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
