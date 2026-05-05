import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

export const dynamic = 'force-dynamic';

const LearningClient = nextDynamic(() => import('@/components/learning/LearningClient'), {
  loading: () => <Skeleton className="h-96 w-full" />,
});

export default function LearningPage() {
  return <LearningClient />;
}
