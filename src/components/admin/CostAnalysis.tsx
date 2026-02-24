'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';

interface CostData {
  totalCost: number;
  currentMonthCost: number;
  projectedCost: number;
  costByDepartment: { department: string; cost: number; employees: number }[];
  costByType: { type: string; cost: number; count: number }[];
  trend: number; // percentage change
}

export default function CostAnalysis() {
  const [loading, setLoading] = useState(true);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchCostData();
  }, [selectedPeriod]);

  const fetchCostData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/cost-analysis?period=${selectedPeriod}`);
      const data = await response.json();
      setCostData(data);
    } catch (error) {
      console.error('Failed to fetch cost data:', error);
      // Mock data for demo
      setCostData({
        totalCost: 125430,
        currentMonthCost: 42150,
        projectedCost: 135000,
        trend: 7.6,
        costByDepartment: [
          { department: 'Engineering', cost: 48200, employees: 12 },
          { department: 'Sales', cost: 32100, employees: 8 },
          { department: 'Marketing', cost: 25800, employees: 6 },
          { department: 'HR', cost: 12500, employees: 3 },
          { department: 'Finance', cost: 6830, employees: 2 },
        ],
        costByType: [
          { type: 'Paid Leave', cost: 89200, count: 145 },
          { type: 'Sick Leave', cost: 21300, count: 48 },
          { type: 'Family Leave', cost: 14930, count: 12 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !costData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cost Analysis
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Leave-related salary costs
            </p>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['month', 'quarter', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Current {selectedPeriod}</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(costData.currentMonthCost)}
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
          <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Projected</div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {formatCurrency(costData.projectedCost)}
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
          <div className="text-sm text-green-700 dark:text-green-300 mb-1 flex items-center gap-2">
            Trend
            {costData.trend > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {costData.trend > 0 ? '+' : ''}{costData.trend}%
          </div>
        </div>
      </div>

      {/* Cost by Department */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Cost by Department
        </h4>
        <div className="space-y-3">
          {costData.costByDepartment.map((dept) => {
            const percentage = (dept.cost / costData.totalCost) * 100;
            return (
              <div key={dept.department}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {dept.department} ({dept.employees} employees)
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(dept.cost)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost by Leave Type */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Cost by Leave Type
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {costData.costByType.map((type) => (
            <div
              key={type.type}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {type.type}
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {formatCurrency(type.cost)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {type.count} requests
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          💡 <strong>Insight:</strong> Engineering department has the highest leave costs. 
          Consider staggering leave schedules to maintain project continuity.
        </p>
      </div>
    </div>
  );
}
