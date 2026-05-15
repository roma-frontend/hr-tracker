import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

const CareersClient = nextDynamic(() => import('@/components/careers/CareersClient'), {
  loading: () => <Skeleton className="h-screen w-full" />,
});

export default function CareersPage() {
  return <CareersClient />;
}
