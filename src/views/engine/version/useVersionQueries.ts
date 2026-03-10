import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { versionsService } from '@/services/integrated/version/api';
import type {
  CreateVersionParams,
  VersionListParams,
  PublishVersionParams,
  VersionCompareParams,
} from '@/services/integrated/version/model';

// 查询键常量
export const VERSION_QUERY_KEYS = {
  all: ['versions'] as const,
  lists: () => [...VERSION_QUERY_KEYS.all, 'list'] as const,
  list: (params: VersionListParams) => [...VERSION_QUERY_KEYS.lists(), params] as const,
  details: () => [...VERSION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...VERSION_QUERY_KEYS.details(), id] as const,
  comparisons: () => [...VERSION_QUERY_KEYS.all, 'comparison'] as const,
  comparison: (params: VersionCompareParams) => [...VERSION_QUERY_KEYS.comparisons(), params] as const,
  impacts: () => [...VERSION_QUERY_KEYS.all, 'impact'] as const,
  impact: (workflowId: string, versionId: string) => [...VERSION_QUERY_KEYS.impacts(), workflowId, versionId] as const,
} as const;

/**
 * 获取版本列表
 */
export const useVersionList = (params: VersionListParams, enabled = true) => {
  return useQuery({
    queryKey: VERSION_QUERY_KEYS.list(params),
    queryFn: () => versionsService.getVersionList(params),
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 10 * 60 * 1000, // 10分钟后垃圾回收
    enabled: enabled && !!params.workflowId,
  });
};

/**
 * 创建版本
 */
export const useCreateVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateVersionParams) => versionsService.createVersion(params),
    onSuccess: () => {
      // 使版本列表缓存失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: VERSION_QUERY_KEYS.lists(),
      });
    },
  });
};

/**
 * 删除版本
 */
export const useDeleteVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, versionId }: { workflowId: string; versionId: string }) =>
      versionsService.deleteVersion(workflowId, versionId),
    onSuccess: () => {
      // 使版本列表缓存失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: VERSION_QUERY_KEYS.lists(),
      });
    },
  });
};

/**
 * 发布版本
 */
export const usePublishVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, versionId }: { workflowId: string; versionId: string }) =>
      versionsService.publishVersion({ workflowId, version: versionId }),
    onSuccess: () => {
      // 使版本列表缓存失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: VERSION_QUERY_KEYS.lists(),
      });
    },
  });
};

/**
 * 回滚版本
 */
export const useRollbackVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, versionId }: { workflowId: string; versionId: string }) =>
      versionsService.rollbackVersion({ workflowId, fromVersion: versionId, toVersion: versionId }),
    onSuccess: () => {
      // 使版本列表缓存失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: VERSION_QUERY_KEYS.lists(),
      });
    },
  });
};

/**
 * 获取版本详情
 */
export const useVersionDetail = (workflowId: string, versionId: string, enabled = true) => {
  return useQuery({
    queryKey: VERSION_QUERY_KEYS.detail(versionId),
    queryFn: () => versionsService.getVersionDetail(workflowId, versionId),
    enabled: enabled && !!versionId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 版本对比
 */
export const useCompareVersions = (params: VersionCompareParams, enabled = true) => {
  return useQuery({
    queryKey: VERSION_QUERY_KEYS.comparison(params),
    queryFn: () => versionsService.compareVersions(params),
    enabled: enabled && !!params.baseVersion && !!params.targetVersion,
    staleTime: 2 * 60 * 1000, // 2分钟内数据被认为是新鲜的
  });
};

/**
 * 版本影响评估
 */
export const useVersionImpact = (workflowId: string, versionId: string, enabled = true) => {
  return useQuery({
    queryKey: VERSION_QUERY_KEYS.impact(workflowId, versionId),
    queryFn: () => versionsService.assessVersionImpact(workflowId, versionId),
    enabled: enabled && !!workflowId && !!versionId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 发布版本（带参数）
 */
export const usePublishVersionWithParams = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: PublishVersionParams) => versionsService.publishVersion(params),
    onSuccess: () => {
      // 使版本列表缓存失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: VERSION_QUERY_KEYS.lists(),
      });
    },
  });
};
