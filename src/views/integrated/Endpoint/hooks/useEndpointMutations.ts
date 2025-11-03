import type { EndpointFormData } from '@/services/integrated/endpoint/endpointApi';
import { endpointService } from '@/services/integrated/endpoint/endpointApi';
import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';

/**
 * 端点Mutations Hook
 * 集中管理所有端点相关的mutation操作
 */
export const useEndpointMutations = (
  onSuccess?: () => void,
  onClearSelection?: () => void
) => {
  const { message } = App.useApp();

  // 新增/编辑端点
  const saveEndpoint = useMutation({
    mutationFn: (data: EndpointFormData) => {
      if (data.id) {
        return endpointService.updateEndpoint(data);
      }
      return endpointService.addEndpoint(data);
    },
    onSuccess: () => {
      message.success('操作成功！');
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(`操作失败：${error.message}`);
    },
  });

  // 删除端点
  const deleteEndpoint = useMutation({
    mutationFn: (id: string) => endpointService.deleteEndpoint(id),
    onSuccess: () => {
      message.success('删除成功！');
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(`删除失败：${error.message}`);
    },
  });

  // 批量删除端点
  const batchDeleteEndpoint = useMutation({
    mutationFn: (ids: string[]) => endpointService.batchDeleteEndpoint(ids),
    onSuccess: () => {
      message.success('批量删除成功！');
      onClearSelection?.();
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(`批量删除失败：${error.message}`);
    },
  });

  // 更新端点状态
  const updateStatus = useMutation({
    mutationFn: (data: EndpointFormData) => endpointService.updateEndpoint(data),
    onSuccess: () => {
      message.success('状态更新成功！');
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(`状态更新失败：${error.message}`);
    },
  });

  // 导出端点配置
  const exportConfig = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => endpointService.exportConfig(id, name),
    onSuccess: () => {
      message.success('导出成功！');
    },
    onError: (error: any) => {
      message.error(`导出失败：${error.message}`);
    },
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

