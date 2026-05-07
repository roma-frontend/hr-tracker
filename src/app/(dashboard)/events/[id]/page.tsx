import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

export const dynamic = 'force-dynamic';

const EventDetailClient = nextDynamic(() => import('@/components/events/EventDetailClient'), {
  loading: () => <Skeleton className="h-96 w-full" />,
});

export default function EventDetailPage() {
  return <EventDetailClient />;
}
