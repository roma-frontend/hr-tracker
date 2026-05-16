import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Features — HR Office Modules',
  description:
    'Explore HR Office modules: employee management, leave tracking, attendance with face recognition, task management, AI analytics, and more.',
  openGraph: {
    title: 'Features — HR Office',
    description: 'All-in-one HR platform with 10+ modules for modern workforce management.',
  },
};

const FeaturesClient = nextDynamic(() => import('@/components/features/FeaturesClient'), {
  loading: () => <Skeleton className="h-screen w-full" />,
});

export default function FeaturesPage() {
  return <FeaturesClient />;
}
