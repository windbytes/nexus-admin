import { QueryClient } from '@tanstack/react-query';

/**
 * React Query 初始化
 *
 * 从 syndra-admin 的 main.tsx 中拆出 QueryClient 创建逻辑，
 * 供 QueryProvider 注入全局数据请求能力。
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        gcTime: 1000 * 60 * 60 * 3,
        networkMode: 'online',
      },
      mutations: {
        networkMode: 'online',
      },
    },
  });
}
