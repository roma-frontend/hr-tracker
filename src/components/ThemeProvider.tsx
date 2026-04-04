'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

/**
 * Suppresses the React 19 warning:
 * "Received `true` for a non-boolean attribute `jsx`"
 *
 * This warning originates from next-themes internals and is harmless.
 */
function suppressJsxWarning() {
  if (typeof window === 'undefined') return;

   
  const originalError = console.error;
   
  console.error = function suppressedError(msg: unknown, ...args: unknown[]) {
    if (
      typeof msg === 'string' &&
      msg.includes('Received `true` for a non-boolean attribute `jsx`')
    ) {
      return;
    }
    originalError.call(this, msg, ...args);
  };
}

suppressJsxWarning();

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
