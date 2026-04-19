'use client';

import { ReactNode } from 'react';

/**
 * Session Provider
 *
 * NextAuth has been removed in favor of Supabase Auth.
 * This is now a no-op wrapper.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
