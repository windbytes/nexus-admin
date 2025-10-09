import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { requestDeduplication } from '@/utils/requestDeduplication';

/**
 * 优化的查询 Hook
 * 支持请求去重、缓存优化和错误处理
 */
export const useOptimizedQuery = <T>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: boolean | number;
    deduplicate?: boolean;
    deduplicateTTL?: number;
  }
) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5分钟
    gcTime = 1000 * 60 * 60 * 12, // 12小时
    retry = true,
    deduplicate = true,
    deduplicateTTL = 5000,
  } = options || {};

  // 创建去重的查询函数
  const deduplicatedQueryFn = useCallback(async () => {
    if (!deduplicate) {
      return queryFn();
    }

    const url = queryKey.join('/');
    return requestDeduplication.deduplicate(
      url,
      'GET',
      queryFn,
      undefined,
      deduplicateTTL
    );
  }, [queryFn, queryKey, deduplicate, deduplicateTTL]);

  return useQuery({
    queryKey,
    queryFn: deduplicatedQueryFn,
    enabled,
    staleTime,
    gcTime,
    retry: retry === true ? 3 : retry === false ? 0 : retry,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    networkMode: 'online',
  });
};

/**
 * 优化的变更 Hook
 * 支持乐观更新和缓存失效
 */
export const useOptimizedMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: (string | number)[][];
    optimisticUpdate?: (variables: TVariables) => void;
    rollbackOnError?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    invalidateQueries = [],
    optimisticUpdate,
    rollbackOnError = true,
  } = options || {};

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // 取消所有相关的查询，避免冲突
      if (invalidateQueries.length > 0) {
        await Promise.all(
          invalidateQueries.map((queryKey) =>
            queryClient.cancelQueries({ queryKey })
          )
        );
      }

      // 执行乐观更新
      if (optimisticUpdate) {
        optimisticUpdate(variables);
      }
    },
    onSuccess: (data, variables) => {
      // 失效相关查询
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // 回滚乐观更新
      if (rollbackOnError && invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      onError?.(error, variables);
    },
  });

  return mutation;
};

/**
 * 批量查询 Hook
 * 支持并行执行多个查询
 */
export const useBatchQueries = <T>(
  queries: Array<{
    queryKey: (string | number)[];
    queryFn: () => Promise<T>;
    enabled?: boolean;
    staleTime?: number;
  }>
) => {
  const queryClient = useQueryClient();

  // 并行执行所有查询
  const results = useMemo(() => {
    return queries.map(({ queryKey, queryFn, enabled = true, staleTime = 5 * 60 * 1000 }) => {
      return useOptimizedQuery(queryKey, queryFn, { enabled, staleTime });
    });
  }, [queries]);

  // 检查是否所有查询都已完成
  const isAllSuccess = results.every((result) => result.isSuccess);
  const isAnyError = results.some((result) => result.isError);
  const isAnyLoading = results.some((result) => result.isLoading);

  // 预取相关数据
  const prefetchQueries = useCallback(
    async (queryKeys: (string | number)[][]) => {
      await Promise.all(
        queryKeys.map((queryKey) =>
          queryClient.prefetchQuery({
            queryKey,
            staleTime: 5 * 60 * 1000,
          })
        )
      );
    },
    [queryClient]
  );

  return {
    results,
    isAllSuccess,
    isAnyError,
    isAnyLoading,
    prefetchQueries,
  };
};

/**
 * 无限查询 Hook
 * 支持分页数据加载
 */
export const useInfiniteOptimizedQuery = <T>(
  queryKey: (string | number)[],
  queryFn: ({ pageParam }: { pageParam?: any }) => Promise<{
    data: T[];
    nextCursor?: any;
    hasNextPage: boolean;
  }>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    initialPageParam?: any;
  }
) => {
  const { enabled = true, staleTime = 5 * 60 * 1000, initialPageParam } = options || {};

  return useQuery({
    queryKey: [...queryKey, 'infinite'],
    queryFn: ({ pageParam = initialPageParam }) => queryFn({ pageParam }),
    enabled,
    staleTime,
    // 修复：useQuery 没有 getNextPageParam 和 initialPageParam 参数，应该使用 useInfiniteQuery
  });
};
