import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

export const dynamic = 'force-dynamic';

const TaskDetailClient = nextDynamic(() => import('@/components/tasks/TaskDetailClient'), {
  loading: () => <Skeleton className="h-96 w-full" />,
});

export default function TaskDetailPage() {
  return <TaskDetailClient />;
}
