import type { EndpointFormData } from '@/services/integrated/endpoint/endpointApi';
import { endpointService } from '@/services/integrated/endpoint/endpointApi';
import { useMutation } from '@tanstack/react-query';

/**
 * 端点Mutations Hook
 * 集中管理所有端点相关的mutation操作
 */
export const useEndpointMutations = (onSuccess?: () => void, onClearSelection?: () => void) => {
  // 新增/编辑端点
  const saveEndpoint = useMutation({
    mutationFn: (data: EndpointFormData) => {
      if (data.id) {
        return endpointService.updateEndpoint(data);
      }
      return endpointService.addEndpoint(data);
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // 删除端点
  const deleteEndpoint = useMutation({
    mutationFn: (id: string) => endpointService.deleteEndpoint(id),
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // 批量删除端点
  const batchDeleteEndpoint = useMutation({
    mutationFn: (ids: string[]) => endpointService.batchDeleteEndpoint(ids),
    onSuccess: () => {
      onClearSelection?.();
      onSuccess?.();
    },
  });

  // 更新端点状态
  const updateStatus = useMutation({
    mutationFn: (data: EndpointFormData) => endpointService.updateEndpoint(data),
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // 导出端点配置
  const exportConfig = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => endpointService.exportConfig(id, name),
  });

  // 计算加载状态
  const isLoading =
    saveEndpoint.isPending ||
    deleteEndpoint.isPending ||
    batchDeleteEndpoint.isPending ||
    updateStatus.isPending ||
    exportConfig.isPending;

  return {
    saveEndpoint,
    deleteEndpoint,
    batchDeleteEndpoint,
    updateStatus,
    exportConfig,
    isLoading,
  };
};
