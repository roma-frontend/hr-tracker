'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * React Query Provider для кэширования данных
 * Уменьшает количество запросов к Convex и улучшает производительность
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: данные считаются свежими 30 секунд
            staleTime: 30 * 1000,
            // GC time: кэш хранится 5 минут
            gcTime: 5 * 60 * 1000,
            // Количество повторных попыток при ошибке
            retry: 2,
            // Задержка между повторными попытками
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // При мутациях не ждём stale time
            gcTime: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools только в development режиме */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
