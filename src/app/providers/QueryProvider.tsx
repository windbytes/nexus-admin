import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { createQueryClient } from '@/app/bootstrap/query';

const queryClient = createQueryClient();

/**
 * React Query Provider
 *
 * 向应用注入 QueryClient，提供全局数据请求 / 缓存 / 重试能力。
 */
export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
