"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Download,
  RefreshCw,
  Calendar,
  CreditCard
} from "lucide-react";
import { useState, useMemo } from "react";

interface Subscription {
  _id: string;
  _creationTime: number;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: number;
  status: string;
  plan: string;
  userEmail?: string;
  organizationId?: string;
  userId?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: number;
  trialEnd?: number;
}

export default function StripeDashboardPage() {
  const subscriptions = useQuery(api.subscriptions.listAll) as Subscription[] | undefined;
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    if (!subscriptions) return null;

    const planPrices: Record<string, number> = {
      starter: 0,
      professional: 49,
      enterprise: 199,
    };

    const byStatus: Record<string, number> = {};
    const byPlan: Record<string, number> = {};
    let mrr = 0;
    let totalRevenue = 0;

    subscriptions.forEach(sub => {
      byStatus[sub.status] = (byStatus[sub.status] || 0) + 1;
      byPlan[sub.plan] = (byPlan[sub.plan] || 0) + 1;

      if (sub.status === 'active') {
        const price = planPrices[sub.plan] || 0;
        mrr += price;
        totalRevenue += price;
      }
    });

    // Calculate growth
    const now = Date.now();
    const lastMonth = now - (30 * 24 * 60 * 60 * 1000);
    const lastMonthSubs = subscriptions.filter(s => s._creationTime < lastMonth);
    const growth = ((subscriptions.length - lastMonthSubs.length) / Math.max(lastMonthSubs.length, 1)) * 100;

    // Trial reminders
    const trialEnding = subscriptions.filter(sub => {
      if (sub.status !== 'trialing' || !sub.trialEnd) return false;
      const daysLeft = Math.ceil((sub.trialEnd - now) / (1000 * 60 * 60 * 24));
      return daysLeft >= 0 && daysLeft <= 7;
    });

    return {
      total: subscriptions.length,
      byStatus,
      byPlan,
      mrr,
      totalRevenue,
      growth: growth.toFixed(1),
      trialEnding: trialEnding.length,
      active: byStatus.active || 0,
      trialing: byStatus.trialing || 0,
      canceled: byStatus.canceled || 0,
    };
  }, [subscriptions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = () => {
    // Trigger export script
    window.alert('Export functionality - run: npm run stripe:export');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      trialing: 'bg-blue-500',
      canceled: 'bg-red-500',
      past_due: 'bg-yellow-500',
      incomplete: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusEmoji = (status: string) => {
    const emojis: Record<string, string> = {
      active: '✅',
      trialing: '🆓',
      canceled: '❌',
      past_due: '⚠️',
      incomplete: '⏳',
    };
    return emojis[status] || '❓';
  };

  const getPlanEmoji = (plan: string) => {
    const emojis: Record<string, string> = {
      starter: '🚀',
      professional: '💼',
      enterprise: '🏢',
    };
    return emojis[plan] || '📦';
  };

  if (subscriptions === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">💳 Stripe Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time subscription analytics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} active, {stats.trialing} trialing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue (MRR)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.mrr}</div>
              <p className="text-xs text-muted-foreground">
                From {stats.active} active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.growth}%</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial Ending Soon</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trialEnding}</div>
              <p className="text-xs text-muted-foreground">
                Within 7 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Breakdown */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions by Status</CardTitle>
              <CardDescription>Current distribution of subscription statuses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getStatusEmoji(status)}</span>
                    <span className="capitalize font-medium">{status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-secondary rounded-full h-2">
                      <div
                        className={`${getStatusColor(status)} h-2 rounded-full transition-all`}
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Plan Breakdown */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions by Plan</CardTitle>
              <CardDescription>Distribution across pricing tiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.byPlan).map(([plan, count]) => {
                const prices: Record<string, number> = {
                  starter: 0,
                  professional: 49,
                  enterprise: 199,
                };
                const price = prices[plan] || 0;
                
                return (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getPlanEmoji(plan)}</span>
                      <span className="capitalize font-medium">{plan}</span>
                      <span className="text-xs text-muted-foreground">${price}/mo</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-12 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscriptions</CardTitle>
          <CardDescription>Latest subscription activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">MRR</th>
                  <th className="pb-3 font-semibold">Period End</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions?.slice(0, 10).map((sub) => {
                  const prices: Record<string, number> = {
                    starter: 0,
                    professional: 49,
                    enterprise: 199,
                  };
                  const price = prices[sub.plan] || 0;

                  return (
                    <tr key={sub._id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{sub.userEmail || 'No email'}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="capitalize">{getPlanEmoji(sub.plan)} {sub.plan}</span>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="capitalize">
                          {getStatusEmoji(sub.status)} {sub.status}
                        </Badge>
                      </td>
                      <td className="py-3 font-semibold">
                        ${price}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(sub.stripeCurrentPeriodEnd).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
