'use client';

import { ReactNode } from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

/**
 * Session Provider for Auth.js v5
 *
 * Wraps children with next-auth SessionProvider to enable useSession() hook.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
