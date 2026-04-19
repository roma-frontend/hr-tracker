import { ReactNode } from 'react';
import { AppProviders } from '@/components/AppProviders';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
