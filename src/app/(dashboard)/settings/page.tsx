import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

const PageClient = nextDynamic(() => import('./_client'), {
  loading: () => <Skeleton className="h-96 w-full" />,
});

export default function SettingsPage() {
  return <PageClient />;
}
