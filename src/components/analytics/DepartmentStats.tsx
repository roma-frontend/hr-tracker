"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DepartmentStatsProps {
  users: Array<{
    department?: string;
    paidLeaveBalance: number;
    sickLeaveBalance: number;
    familyLeaveBalance: number;
  }>;
}

export function DepartmentStats({ users }: DepartmentStatsProps) {
  // Group by department
  const departments = users.reduce((acc, user) => {
    const dept = user.department || 'Unassigned';
    if (!acc[dept]) {
      acc[dept] = {
        department: dept,
        employees: 0,
        totalPaidLeave: 0,
        totalSickLeave: 0,
        totalFamilyLeave: 0,
      };
    }
    acc[dept].employees += 1;
    acc[dept].totalPaidLeave += user.paidLeaveBalance;
    acc[dept].totalSickLeave += user.sickLeaveBalance;
    acc[dept].totalFamilyLeave += user.familyLeaveBalance;
    return acc;
  }, {} as Record<string, any>);

  const data = Object.values(departments).map((dept: any) => ({
    department: dept.department,
    avgPaid: Math.round(dept.totalPaidLeave / dept.employees),
    avgSick: Math.round(dept.totalSickLeave / dept.employees),
    avgFamily: Math.round(dept.totalFamilyLeave / dept.employees),
    employees: dept.employees,
  }));

  return (
    <div className="bg-[var(--background)] rounded-2xl p-6 shadow-lg border border-[var(--border)]">
      <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
        🏢 Department Leave Balance
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" opacity={0.3} />
          <XAxis 
            dataKey="department" 
            className="fill-[var(--text-muted)]"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            className="fill-[var(--text-muted)]"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)'
            }}
          />
          <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
          <Bar dataKey="avgPaid" fill="#2563eb" name="Paid Leave" />
          <Bar dataKey="avgSick" fill="#0ea5e9" name="Sick Leave" />
          <Bar dataKey="avgFamily" fill="#EC4899" name="Family Leave" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DepartmentStats;
