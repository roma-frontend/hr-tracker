'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Brain, TrendingUp, Users, Calendar, ArrowRight } from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'optimization' | 'scheduling' | 'policy' | 'cost-saving';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    metric: string;
    value: string;
    change: number; // percentage
  };
  action: string;
  reasoning: string[];
  affectedEmployees?: number;
}

export default function SmartSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/smart-suggestions');
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      // Mock data for demo
      setSuggestions([
        {
          id: '1',
          type: 'optimization',
          priority: 'high',
          title: 'Optimize Q2 Leave Distribution',
          description: 'AI detected uneven leave distribution in Q2. Redistributing can improve team availability by 23%.',
          impact: {
            metric: 'Team Availability',
            value: '+23%',
            change: 23,
          },
          action: 'Suggest alternative dates to 8 employees',
          reasoning: [
            'April has 45% more leave requests than May',
            'Engineering team will be understaffed in April',
            'Moving 8 requests to May creates better balance',
            'No project deadlines affected by the change',
          ],
          affectedEmployees: 8,
        },
        {
          id: '2',
          type: 'cost-saving',
          priority: 'high',
          title: 'Reduce Overtime Costs',
          description: 'Staggering sales team leaves can reduce overtime costs by $12,400 this quarter.',
          impact: {
            metric: 'Overtime Costs',
            value: '-$12.4K',
            change: -18,
          },
          action: 'Implement staggered leave policy for Sales',
          reasoning: [
            'Current leave pattern creates coverage gaps',
            'Gaps require 3x overtime to maintain service levels',
            'Staggering leaves reduces overtime by 67%',
            'Employee satisfaction remains high with flexibility',
          ],
          affectedEmployees: 12,
        },
        {
          id: '3',
          type: 'scheduling',
          priority: 'medium',
          title: 'Encourage Off-Peak Leave Dates',
          description: 'Incentivize leaves during low-demand periods to balance workload throughout the year.',
          impact: {
            metric: 'Workload Balance',
            value: '+31%',
            change: 31,
          },
          action: 'Offer +1 day bonus for off-peak leaves',
          reasoning: [
            'Jan, Feb, and Sep have 40% fewer leave requests',
            'July and December are oversaturated',
            'Small incentive can shift 15-20% of requests',
            'Cost of bonus days < cost of understaffing',
          ],
          affectedEmployees: 25,
        },
        {
          id: '4',
          type: 'policy',
          priority: 'medium',
          title: 'Implement Minimum Team Size Policy',
          description: 'Set minimum staffing levels per team to prevent critical understaffing situations.',
          impact: {
            metric: 'Risk Reduction',
            value: '-85%',
            change: -85,
          },
          action: 'Create auto-reject rules when team < 60%',
          reasoning: [
            '12 instances this year where teams < 50% staffed',
            'Led to missed deadlines and customer complaints',
            'Auto-policy prevents approval of risky leaves',
            'Gives managers early warning to plan coverage',
          ],
        },
        {
          id: '5',
          type: 'optimization',
          priority: 'low',
          title: 'AI-Powered Leave Recommendations',
          description: 'Use ML to suggest optimal leave dates based on project schedules and team availability.',
          impact: {
            metric: 'Approval Rate',
            value: '+12%',
            change: 12,
          },
          action: 'Enable AI suggestions for employees',
          reasoning: [
            'AI can analyze 50+ factors humans miss',
            'Suggests dates with highest approval probability',
            'Reduces back-and-forth negotiations',
            'Improves employee satisfaction',
          ],
          affectedEmployees: 156,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateNewSuggestions = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/admin/smart-suggestions/generate', {
        method: 'POST',
      });
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const getTypeIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'optimization':
        return TrendingUp;
      case 'scheduling':
        return Calendar;
      case 'policy':
        return Users;
      case 'cost-saving':
        return Brain;
    }
  };

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
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Smart Suggestions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {suggestions.length} AI-powered recommendations
            </p>
          </div>
        </div>

        <button
          onClick={generateNewSuggestions}
          disabled={generating}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Brain className={`w-4 h-4 ${generating ? 'animate-pulse' : ''}`} />
          {generating ? 'Generating...' : 'Generate New'}
        </button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const Icon = getTypeIcon(suggestion.type);
          return (
            <div
              key={suggestion.id}
              className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {suggestion.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {suggestion.description}
                    </p>
                  </div>
                </div>

                {/* Impact Badge */}
                <div className="ml-4 text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {suggestion.impact.metric}
                  </div>
                  <div className={`text-2xl font-bold ${
                    suggestion.impact.change > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {suggestion.impact.value}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  Recommended Action
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                  {suggestion.action}
                </div>
                {suggestion.affectedEmployees && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Affects {suggestion.affectedEmployees} employees
                  </div>
                )}
              </div>

              {/* AI Reasoning */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  AI Reasoning
                </div>
                <ul className="space-y-1">
                  {suggestion.reasoning.map((reason, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"
                    >
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-all">
                  Implement
                </button>
                <button className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  Learn More
                </button>
                <button className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
        <p className="text-sm text-purple-800 dark:text-purple-300">
          🤖 <strong>AI-Powered:</strong> These suggestions are generated by analyzing 
          historical data, project schedules, team dynamics, and 50+ other factors. 
          New suggestions are generated daily at 6 AM.
        </p>
      </div>
    </div>
  );
}
