import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

const ContactClient = nextDynamic(() => import('@/components/contact/ContactClient'), {
  loading: () => <Skeleton className="h-screen w-full" />,
});

export default function ContactPage() {
  return <ContactClient />;
}
