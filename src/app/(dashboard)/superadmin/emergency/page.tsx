"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { Id } from "@/convex/_generated/dataModel";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Users,
  Building2,
  AlertOctagon,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function EmergencyDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [createIncidentOpen, setCreateIncidentOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  const data = useQuery(api.superadmin.getEmergencyDashboard);
  const createIncident = useMutation(api.superadmin.createIncident);
  const updateIncidentStatus = useMutation(api.superadmin.updateIncidentStatus);

  if (!data || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-muted-foreground">{t('loading')}</div>
      </div>
    );
  }

  const {
    criticalTickets,
    activeIncidents,
    slaBreaches,
    suspiciousIPs,
    maintenanceModeOrgs,
    pendingOrgRequests,
    priorityLevel,
    priorityScore,
    issues,
    requiresAttention,
  } = data;

  const getPriorityColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/30";
      case "high":
        return "text-orange-500 bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
      default:
        return "text-green-500 bg-green-500/10 border-green-500/30";
    }
  };

  const handleCreateIncident = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const severity = formData.get("severity") as any;
    const affectedUsers = parseInt(formData.get("affectedUsers") as string);
    const affectedOrgs = parseInt(formData.get("affectedOrgs") as string);

    if (!title || !description) {
      toast.error(t('superadmin.emergency.alerts.fillRequiredFields'));
      return;
    }

    try {
      await createIncident({
        createdBy: user.id as Id<"users">,
        title,
        description,
        severity,
        affectedUsers,
        affectedOrgs,
      });

      toast.success(t('superadmin.emergency.alerts.incidentCreated'));
      setCreateIncidentOpen(false);
    } catch (error) {
      toast.error(t('superadmin.emergency.alerts.errorCreatingIncident'));
      console.error(error);
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    const rootCause = prompt(t('superadmin.emergency.alerts.specifyRootCause'));
    if (!rootCause) return;

    const resolution = prompt(t('superadmin.emergency.alerts.specifyResolution'));
    if (!resolution) return;

    try {
      await updateIncidentStatus({
        incidentId: incidentId as Id<"emergencyIncidents">,
        status: "resolved",
        userId: user.id as Id<"users">,
        rootCause,
        resolution,
      });

      toast.success(t('superadmin.emergency.alerts.incidentResolved'));
    } catch (error) {
      toast.error(t('superadmin.emergency.alerts.errorResolvingIncident'));
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
                  🚨 {t('superadmin.emergency.title')}
                </h1>
                <Badge className={`${getPriorityColor(priorityLevel)} text-lg px-4 py-1`}>
                  {priorityLevel === "critical" && "🔴"}
                  {priorityLevel === "high" && "🟠"}
                  {priorityLevel === "medium" && "🟡"}
                  {priorityLevel === "low" && "🟢"}
                  {" "}{priorityLevel.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {t('superadmin.emergency.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={() => setCreateIncidentOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                {t('superadmin.emergency.createIncident')}
              </Button>
            </div>
          </div>
        </div>

        {/* Priority Score */}
        {requiresAttention && (
          <Card className="mb-6 border-red-500/50 animate-pulse" style={{ background: "var(--card)" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertOctagon className="w-12 h-12 text-red-500" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-500 mb-1">
                    {t('superadmin.emergency.attentionRequired')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('superadmin.emergency.problemsDetected', { problems: issues.join(", ") })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-red-500">{priorityScore}</p>
                  <p className="text-xs text-muted-foreground">{t('superadmin.emergency.priorityScore')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            title={t('superadmin.emergency.criticalTickets')}
            value={criticalTickets.length}
            icon={AlertTriangle}
            color="red"
            subtitle={t('superadmin.emergency.criticalTicketsSubtitle')}
          />
          <StatCard
            title={t('superadmin.emergency.activeIncidents')}
            value={activeIncidents.length}
            icon={Activity}
            color="orange"
            subtitle={t('superadmin.emergency.activeIncidentsSubtitle')}
          />
          <StatCard
            title={t('superadmin.emergency.slaBreaches')}
            value={slaBreaches}
            icon={Clock}
            color="yellow"
            subtitle={t('superadmin.emergency.slaBreachesSubtitle')}
          />
          <StatCard
            title={t('superadmin.emergency.suspiciousIPs')}
            value={suspiciousIPs.length}
            icon={Shield}
            color="purple"
            subtitle={t('superadmin.emergency.suspiciousIPsSubtitle')}
          />
          <StatCard
            title={t('superadmin.emergency.maintenanceMode')}
            value={maintenanceModeOrgs}
            icon={Building2}
            color="blue"
            subtitle={t('superadmin.emergency.maintenanceModeSubtitle')}
          />
          <StatCard
            title={t('superadmin.emergency.pendingOrgs')}
            value={pendingOrgRequests}
            icon={Users}
            color="green"
            subtitle={t('superadmin.emergency.pendingOrgsSubtitle')}
          />
        </div>

        {/* Critical Tickets */}
        {criticalTickets.length > 0 && (
          <Card className="mb-6 border-red-500/50" style={{ background: "var(--card)" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                {t('superadmin.emergency.criticalTickets')}
              </CardTitle>
              <CardDescription>
                {t('superadmin.emergency.criticalTicketsSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalTickets.map((ticket: any) => (
                  <div
                    key={ticket._id}
                    className="p-4 rounded-lg border border-red-500/30 bg-red-500/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm">{ticket.ticketNumber}</span>
                          <Badge variant="destructive">CRITICAL</Badge>
                          <Badge variant="outline">{ticket.status}</Badge>
                        </div>
                        <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                          {ticket.title}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          <span>👤 {ticket.creatorName}</span>
                          {ticket.organizationName && (
                            <span className="ml-3">🏢 {ticket.organizationName}</span>
                          )}
                          <span className="ml-3">⏱️ {ticket.minutesOpen} {t('common.minutesAgo')}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/superadmin/support?ticket=${ticket._id}`}
                      >
                        {t('superadmin.emergency.actions.open')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Incidents */}
        {activeIncidents.length > 0 && (
          <Card className="mb-6 border-orange-500/50" style={{ background: "var(--card)" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-500">
                <Activity className="w-5 h-5" />
                {t('superadmin.emergency.activeIncidents')}
              </CardTitle>
              <CardDescription>
                {t('superadmin.emergency.activeIncidentsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeIncidents.map((incident: any) => (
                  <div
                    key={incident._id}
                    className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              incident.severity === "critical"
                                ? "destructive"
                                : incident.severity === "high"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline">{incident.status}</Badge>
                        </div>
                        <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                          {incident.title}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {incident.description}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          <span>👥 {incident.affectedUsers} {t('superadmin.emergency.usersAffected')}</span>
                          <span className="ml-3">🏢 {incident.affectedOrgs} {t('superadmin.emergency.organizations')}</span>
                          <span className="ml-3">⏱️ {incident.minutesActive} {t('common.minutesActive')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveIncident(incident._id)}
                        >
                          {t('superadmin.emergency.actions.resolve')}
                        </Button>
                        <Button variant="ghost" size="icon">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suspicious IPs */}
        {suspiciousIPs.length > 0 && (
          <Card className="mb-6 border-purple-500/50" style={{ background: "var(--card)" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-500">
                <Shield className="w-5 h-5" />
                {t('superadmin.emergency.suspiciousIPs')}
              </CardTitle>
              <CardDescription>
                {t('superadmin.emergency.suspiciousIPsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suspiciousIPs.map((ipData: any) => (
                  <div
                    key={ipData.ip}
                    className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                          🌐 {ipData.ip}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ipData.attempts} {t('superadmin.emergency.failedAttempts')} • {ipData.userIds.length} {t('superadmin.emergency.users')}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {t('superadmin.emergency.actions.block')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card style={{ background: "var(--card)" }}>
          <CardHeader>
            <CardTitle>{t('superadmin.emergency.systemStatus')}</CardTitle>
            <CardDescription>
              {t('superadmin.emergency.systemStatusSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SystemStatusItem
                name={t('superadmin.emergency.systemComponents.api')}
                status={t('superadmin.emergency.systemComponents.operational')}
                latency="45ms"
              />
              <SystemStatusItem
                name={t('superadmin.emergency.systemComponents.database')}
                status={t('superadmin.emergency.systemComponents.operational')}
                latency="12ms"
              />
              <SystemStatusItem
                name={t('superadmin.emergency.systemComponents.emailService')}
                status={t('superadmin.emergency.systemComponents.operational')}
                latency="230ms"
              />
              <SystemStatusItem
                name={t('superadmin.emergency.systemComponents.stripe')}
                status={t('superadmin.emergency.systemComponents.operational')}
                latency="180ms"
              />
              <SystemStatusItem
                name={t('superadmin.emergency.systemComponents.convex')}
                status={t('superadmin.emergency.systemComponents.operational')}
                latency="35ms"
              />
              <SystemStatusItem
                name={t('superadmin.emergency.systemComponents.redis')}
                status={t('superadmin.emergency.systemComponents.operational')}
                latency="8ms"
              />
              <SystemStatusItem
                name={t('superadmin.emergency.systemComponents.cloudinary')}
                status={t('superadmin.emergency.systemComponents.operational')}
                latency="320ms"
              />
              <SystemStatusItem
                name={t('superadmin.emergency.systemComponents.sentry')}
                status={t('superadmin.emergency.systemComponents.operational')}
                latency="95ms"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Incident Dialog */}
      <Dialog open={createIncidentOpen} onOpenChange={setCreateIncidentOpen}>
        <DialogContent className="max-w-2xl">
          <form action={handleCreateIncident}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {t('superadmin.emergency.createIncident')}
              </DialogTitle>
              <DialogDescription>
                {t('superadmin.emergency.create.description')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">{t('superadmin.emergency.create.titleLabel')}</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder={t('superadmin.emergency.create.titlePlaceholder')}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="severity">{t('superadmin.emergency.create.severityLabel')}</Label>
                  <Select name="severity" defaultValue="high">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('priority.low')}</SelectItem>
                      <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                      <SelectItem value="high">{t('priority.high')}</SelectItem>
                      <SelectItem value="critical">{t('priority.critical')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="affectedUsers">{t('superadmin.emergency.create.affectedUsersLabel')}</Label>
                  <Input
                    id="affectedUsers"
                    name="affectedUsers"
                    type="number"
                    defaultValue={0}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="affectedOrgs">{t('superadmin.emergency.create.affectedOrgsLabel')}</Label>
                <Input
                  id="affectedOrgs"
                  name="affectedOrgs"
                  type="number"
                  defaultValue={0}
                />
              </div>

              <div>
                <Label htmlFor="description">{t('superadmin.emergency.create.descriptionLabel')}</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t('superadmin.emergency.create.descriptionPlaceholder')}
                  rows={6}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateIncidentOpen(false)}
              >
                {t('actions.cancel')}
              </Button>
              <Button type="submit" variant="destructive">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {t('superadmin.emergency.createIncident')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  subtitle: string;
}) {
  const colorClasses: Record<string, string> = {
    red: "text-red-500",
    orange: "text-orange-500",
    yellow: "text-yellow-500",
    purple: "text-purple-500",
    blue: "text-blue-500",
    green: "text-green-500",
  };

  return (
    <Card style={{ background: "var(--background-subtle)" }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">{title}</p>
          <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

// System Status Item
function SystemStatusItem({
  name,
  status,
  latency,
}: {
  name: string;
  status: string;
  latency: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border" style={{ background: "var(--background-subtle)" }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground">{latency}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-green-600 capitalize">{status}</span>
      </div>
    </div>
  );
}
