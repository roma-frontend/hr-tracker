/**
 * 📊 SLA Dashboard Component
 * 
 * Displays SLA metrics for leave request response times
 * - Average response time
 * - On-time vs breached percentage
 * - Warning/Critical alerts
 * - Trend over time
 */

'use client';

import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Timer
} from 'lucide-react';

interface SLAMetric {
  _id: string;
  leaveRequestId: string;
  submittedAt: number;
  respondedAt?: number;
  responseTimeHours?: number;
  targetResponseTimeHours: number;
  status: 'pending' | 'on_time' | 'breached';
  warningTriggered: boolean;
  criticalTriggered: boolean;
  slaScore?: number;
  createdAt: number;
}

export function SLADashboard() {
  const slaMetrics = useQuery(api.sla.getSLAStats as any) ?? [];
  const slaConfig = useQuery(api.sla.getSLAConfig);

  // Calculate statistics
  const totalMetrics = slaMetrics.length;
  const pendingMetrics = slaMetrics.filter((m: SLAMetric) => m.status === 'pending').length;
  const onTimeMetrics = slaMetrics.filter((m: SLAMetric) => m.status === 'on_time').length;
  const breachedMetrics = slaMetrics.filter((m: SLAMetric) => m.status === 'breached').length;

  // Calculate average response time (only for responded requests)
  const respondedMetrics = slaMetrics.filter((m: SLAMetric) => m.responseTimeHours !== undefined);
  const avgResponseTime = respondedMetrics.length > 0
    ? respondedMetrics.reduce((sum: number, m: SLAMetric) => sum + (m.responseTimeHours || 0), 0) / respondedMetrics.length
    : 0;

  // Calculate SLA compliance percentage
  const complianceRate = totalMetrics > 0
    ? (onTimeMetrics / totalMetrics) * 100
    : 100;

  // Calculate warning and critical counts
  const warningCount = slaMetrics.filter((m: SLAMetric) => m.warningTriggered && !m.criticalTriggered).length;
  const criticalCount = slaMetrics.filter((m: SLAMetric) => m.criticalTriggered).length;

  // Trend calculation (compare last 7 days vs previous 7 days)
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);

  const recentMetrics = slaMetrics.filter((m: SLAMetric) => m.createdAt >= sevenDaysAgo);
  const previousMetrics = slaMetrics.filter((m: SLAMetric) => m.createdAt >= fourteenDaysAgo && m.createdAt < sevenDaysAgo);

  const recentCompliance = recentMetrics.length > 0
    ? (recentMetrics.filter((m: SLAMetric) => m.status === 'on_time').length / recentMetrics.length) * 100
    : 100;

  const previousCompliance = previousMetrics.length > 0
    ? (previousMetrics.filter((m: SLAMetric) => m.status === 'on_time').length / previousMetrics.length) * 100
    : 100;

  const trend = recentCompliance - previousCompliance;
  const isImproving = trend > 0;

  // Target response time from config
  const targetHours = slaConfig?.targetResponseTimeHours || 24;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Average Response Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg Response Time
          </CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {avgResponseTime.toFixed(1)}h
          </div>
          <p className="text-xs text-muted-foreground">
            Target: {targetHours}h
          </p>
          {avgResponseTime <= targetHours ? (
            <div className="flex items-center text-green-600 text-xs mt-1">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Within target
            </div>
          ) : (
            <div className="flex items-center text-red-600 text-xs mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              Above target
            </div>
          )}
        </CardContent>
      </Card>

      {/* SLA Compliance Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            SLA Compliance
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {complianceRate.toFixed(1)}%
          </div>
          <Progress value={complianceRate} className="mt-2" />
          <div className={`flex items-center text-xs mt-1 ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
            {isImproving ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend).toFixed(1)}% vs last week
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Requests
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {pendingMetrics}
          </div>
          <p className="text-xs text-muted-foreground">
            {onTimeMetrics} on-time, {breachedMetrics} breached
          </p>
          {pendingMetrics > 0 && (
            <Badge variant="secondary" className="mt-2">
              Needs attention
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Alerts
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {warningCount}
              </div>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {criticalCount}
              </div>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </div>
          {(warningCount > 0 || criticalCount > 0) && (
            <Badge variant="destructive" className="mt-2">
              Action required
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Detailed SLA Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>SLA Performance Breakdown</CardTitle>
          <CardDescription>
            Response time distribution for the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* On-time requests */}
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">On Time</div>
              <div className="flex-1">
                <Progress value={complianceRate} className="h-2" />
              </div>
              <div className="w-20 text-right text-sm">
                {onTimeMetrics} ({complianceRate.toFixed(0)}%)
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>

            {/* Breached requests */}
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Breached</div>
              <div className="flex-1">
                <Progress value={100 - complianceRate} className="h-2 [&>div]:bg-destructive" />
              </div>
              <div className="w-20 text-right text-sm">
                {breachedMetrics} ({(100 - complianceRate).toFixed(0)}%)
              </div>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>

            {/* Pending requests */}
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Pending</div>
              <div className="flex-1">
                <Progress value={(pendingMetrics / totalMetrics) * 100} className="h-2 [&>div]:bg-muted-foreground" />
              </div>
              <div className="w-20 text-right text-sm">
                {pendingMetrics} ({totalMetrics > 0 ? ((pendingMetrics / totalMetrics) * 100).toFixed(0) : 0}%)
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* SLA Config Info */}
          {slaConfig && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">SLA Configuration</p>
                  <p className="text-xs text-muted-foreground">
                    Target response time: {slaConfig.targetResponseTimeHours}h
                  </p>
                </div>
                <Badge variant="outline">
                  24/7
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
