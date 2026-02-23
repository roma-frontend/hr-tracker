"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Calendar, TrendingUp, Clock } from 'lucide-react';

interface PersonalAnalyticsProps {
  userId: Id<"users">;
}

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export function PersonalAnalytics({ userId }: PersonalAnalyticsProps) {
  const analytics = useQuery(api.analytics.getUserAnalytics, { userId });

  if (!analytics) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const { totalDaysTaken, pendingDays, leavesByType, balances, userLeaves } = analytics;

  // Data for pie chart
  const pieData = Object.entries(leavesByType).map(([type, days]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: days as number,
  }));

  // Recent leaves
  const recentLeaves = userLeaves
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Days Taken</p>
              <p className="text-3xl font-bold mt-1">{totalDaysTaken}</p>
            </div>
            <Calendar className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending</p>
              <p className="text-3xl font-bold mt-1">{pendingDays}</p>
            </div>
            <Clock className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Remaining</p>
              <p className="text-3xl font-bold mt-1">{balances.paid}</p>
            </div>
            <TrendingUp className="w-10 h-10 opacity-80" />
          </div>
        </div>
      </div>

      {/* Leave Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              📊 Leave Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Leaves */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            📅 Recent Requests
          </h3>
          <div className="space-y-3">
            {recentLeaves.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent requests</p>
            ) : (
              recentLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      leave.status === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : leave.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Leave Balances */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          💼 Leave Balances
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Paid Leave</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{balances.paid}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(balances.paid / 24) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sick Leave</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{balances.sick}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(balances.sick / 10) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Family Leave</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{balances.family}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full"
                style={{ width: `${(balances.family / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
