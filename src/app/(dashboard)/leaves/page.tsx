'use client';

import dynamic from 'next/dynamic';
import { ShieldLoader } from '@/components/ui/ShieldLoader';

function LeavesSkeleton() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <ShieldLoader size="lg" />
    </div>
  );
}

const LeavesClient = dynamic(() => import('@/components/leaves/LeavesClient'), {
  ssr: false,
  loading: () => <LeavesSkeleton />,
});

export default function LeavesPage() {
  return <LeavesClient />;
}
