import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Contact — Enterprise Sales',
  description:
    'Contact HR Office for enterprise plans, custom integrations, and dedicated support.',
  openGraph: {
    title: 'Contact — HR Office',
    description: 'Get in touch for enterprise HR solutions.',
  },
};

const ContactClient = nextDynamic(() => import('@/components/contact/ContactClient'), {
  loading: () => <Skeleton className="h-screen w-full" />,
});

export default function ContactPage() {
  return <ContactClient />;
}
