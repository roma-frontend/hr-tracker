'use client';

import dynamic from 'next/dynamic';
import { WidgetErrorBoundary } from '@/components/error/WidgetErrorBoundary';

const PayrollDashboard = dynamic(
  () =>
    import('@/components/payroll/PayrollDashboard').then((m) => ({
      default: (props: any) => (
        <WidgetErrorBoundary name="PayrollDashboard">
          <m.default {...props} />
        </WidgetErrorBoundary>
      ),
    })),
  {
    ssr: false,
    loading: () => <PayrollSkeleton />,
  },
);

function PayrollSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-(--card) rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-(--card) rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-(--card) rounded-lg" />
        <div className="h-64 bg-(--card) rounded-lg" />
      </div>
    </div>
  );
}

export default function PayrollPage() {
  return (
    <div className="p-4 md:p-6">
      <PayrollDashboard />
    </div>
  );
}
