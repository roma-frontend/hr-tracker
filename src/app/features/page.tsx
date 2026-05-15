import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

const FeaturesClient = nextDynamic(() => import('@/components/features/FeaturesClient'), {
  loading: () => <Skeleton className="h-screen w-full" />,
});

export default function FeaturesPage() {
  return <FeaturesClient />;
}
