'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Users, Calendar, ShieldAlert, CheckCircle } from 'lucide-react';

interface Conflict {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedEmployees: string[];
  dateRange: { start: string; end: string };
  department: string;
  impactLevel: number; // 1-10
  suggestions: string[];
}

export default function ConflictDetection() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');

  useEffect(() => {
    fetchConflicts();
  }, []);

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/conflicts');
      const data = await response.json();
      setConflicts(data);
    } catch (error) {
      console.error('Failed to fetch conflicts:', error);
      // Mock data for demo
      setConflicts([
        {
          id: '1',
          type: 'critical',
          title: 'Multiple Team Leads Absent',
          description: '3 team leads from Engineering will be on leave simultaneously',
          affectedEmployees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
          dateRange: { start: '2026-03-15', end: '2026-03-20' },
          department: 'Engineering',
          impactLevel: 9,
          suggestions: [
            'Request one team lead to reschedule',
            'Assign temporary backup leads',
            'Notify stakeholders about reduced capacity',
          ],
        },
        {
          id: '2',
          type: 'critical',
          title: 'Understaffed Department',
          description: '60% of Sales team will be absent on the same week',
          affectedEmployees: ['Alice Brown', 'Bob Wilson', 'Carol Davis', 'David Lee', 'Emma White'],
          dateRange: { start: '2026-04-01', end: '2026-04-05' },
          department: 'Sales',
          impactLevel: 8,
          suggestions: [
            'Stagger leave dates',
            'Hire temporary sales support',
            'Postpone non-critical sales activities',
          ],
        },
        {
          id: '3',
          type: 'warning',
          title: 'Project Deadline Overlap',
          description: 'Key developers on leave during Q2 product launch',
          affectedEmployees: ['Tom Anderson', 'Sarah Miller'],
          dateRange: { start: '2026-06-20', end: '2026-06-30' },
          department: 'Engineering',
          impactLevel: 7,
          suggestions: [
            'Move launch date by 1 week',
            'Complete critical features before leave',
            'Assign backup developers',
          ],
        },
        {
          id: '4',
          type: 'warning',
          title: 'Holiday Season Rush',
          description: 'High leave requests during holiday season',
          affectedEmployees: ['Multiple employees (12)'],
          dateRange: { start: '2026-12-20', end: '2027-01-05' },
          department: 'All Departments',
          impactLevel: 6,
          suggestions: [
            'Implement leave caps for this period',
            'Offer incentives for off-peak leave dates',
            'Plan skeleton crew schedule',
          ],
        },
        {
          id: '5',
          type: 'info',
          title: 'Training Session Conflict',
          description: 'HR manager on leave during mandatory compliance training',
          affectedEmployees: ['Lisa Taylor'],
          dateRange: { start: '2026-05-10', end: '2026-05-12' },
          department: 'HR',
          impactLevel: 4,
          suggestions: [
            'Reschedule training session',
            'Have backup trainer ready',
            'Record session for later review',
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConflicts = conflicts.filter(
    (c) => filter === 'all' || c.type === filter
  );

  const getTypeColor = (type: Conflict['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          border: 'border-red-300 dark:border-red-700',
          text: 'text-red-800 dark:text-red-300',
          icon: 'text-red-600 dark:text-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          border: 'border-amber-300 dark:border-amber-700',
          text: 'text-amber-800 dark:text-amber-300',
          icon: 'text-amber-600 dark:text-amber-400',
        };
      case 'info':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          border: 'border-blue-300 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-300',
          icon: 'text-blue-600 dark:text-blue-400',
        };
    }
  };

  const criticalCount = conflicts.filter((c) => c.type === 'critical').length;
  const warningCount = conflicts.filter((c) => c.type === 'warning').length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conflict Detection
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {criticalCount} critical, {warningCount} warnings
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['all', 'critical', 'warning'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Conflicts List */}
      <div className="space-y-4">
        {filteredConflicts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No conflicts detected! 🎉
            </p>
          </div>
        ) : (
          filteredConflicts.map((conflict) => {
            const colors = getTypeColor(conflict.type);
            return (
              <div
                key={conflict.id}
                className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg}`}
              >
                {/* Conflict Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${colors.icon}`} />
                    <div className="flex-1">
                      <h4 className={`font-semibold ${colors.text} mb-1`}>
                        {conflict.title}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {conflict.description}
                      </p>
                      
                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(conflict.dateRange.start).toLocaleDateString()} - {new Date(conflict.dateRange.end).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {conflict.affectedEmployees.length} employees
                        </div>
                        <div className="px-2 py-0.5 bg-white/50 dark:bg-gray-900/50 rounded">
                          {conflict.department}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Level */}
                  <div className="ml-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">
                      Impact
                    </div>
                    <div className={`text-2xl font-bold ${colors.text}`}>
                      {conflict.impactLevel}/10
                    </div>
                  </div>
                </div>

                {/* Affected Employees */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Affected Employees:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {conflict.affectedEmployees.slice(0, 3).map((emp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white dark:bg-gray-700 rounded-md text-xs text-gray-700 dark:text-gray-300"
                      >
                        {emp}
                      </span>
                    ))}
                    {conflict.affectedEmployees.length > 3 && (
                      <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-md text-xs text-gray-500 dark:text-gray-400">
                        +{conflict.affectedEmployees.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    💡 Suggested Actions:
                  </div>
                  <ul className="space-y-1">
                    {conflict.suggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"
                      >
                        <span className="text-gray-400">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 flex gap-2">
                  <button className="px-3 py-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    Notify Team
                  </button>
                  <button className="px-3 py-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    Resolve
                  </button>
                  <button className="px-3 py-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
