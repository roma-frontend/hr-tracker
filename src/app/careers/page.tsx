import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Careers — Open Positions',
  description:
    'Browse open positions across organizations using HR Office. Find your next opportunity.',
  openGraph: {
    title: 'Careers — HR Office',
    description: 'Find open positions and apply directly through HR Office.',
  },
};

const CareersClient = nextDynamic(() => import('@/components/careers/CareersClient'), {
  loading: () => <Skeleton className="h-screen w-full" />,
});

export default function CareersPage() {
  return <CareersClient />;
}
