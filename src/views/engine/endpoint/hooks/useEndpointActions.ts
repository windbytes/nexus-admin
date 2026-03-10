import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import type { EndpointFormData, EndpointModel } from '@/services/integrated/endpoint/endpointApi';
import { endpointService } from '@/services/integrated/endpoint/endpointApi';

interface UseEndpointActionsProps {
  // 当前操作的行数据
  currentRow: Partial<EndpointModel> | null;
  // 成功的回调
  onSuccess?: () => void;
}

/**
 * 端点操作相关的 hooks
 */
export const useEndpointActions = ({ currentRow, onSuccess }: UseEndpointActionsProps) => {
  const { modal, message } = App.useApp();

  /**
   * 新增端点
   */
  const createEndpointMutation = useMutation({
    mutationFn: (values: EndpointFormData) => endpointService.addEndpoint(values),
    onSuccess: () => {
      message.success('新增端点成功');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '新增端点失败',
        content: `新增端点时发生错误：${error.message || '未知错误'}。请检查输入数据或联系技术支持。`,
      });
    },
  });

  // 更新端点
  const updateEndpointMutation = useMutation({
    mutationFn: (values: EndpointFormData) => {
      if (!currentRow?.id) {
        throw new Error('当前行数据不存在');
      }
      return endpointService.updateEndpoint({ ...values, id: currentRow.id });
    },
    onSuccess: () => {
      message.success('修改端点成功');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '修改端点失败',
        content: `修改端点时发生错误：${error.message || '未知错误'}。请检查输入数据或联系技术支持。`,
      });
    },
  });

  // 更新端点状态
  const updateStatusMutation = useMutation({
    mutationFn: (data: EndpointFormData) => endpointService.updateEndpoint(data),
    onSuccess,
  });

  // 更新端点状态
  const updateEndpointStatus = (data: EndpointFormData) => {
    updateStatusMutation.mutate(data);
  };

  // 删除端点
  const deleteEndpointMutation = useMutation({
    mutationFn: (id: string) => endpointService.deleteEndpoint(id),
    onSuccess: () => {
      message.success('删除端点成功');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '删除端点失败',
        content: `删除端点时发生错误：${error.message || '未知错误'}。请检查端点状态或联系技术支持。`,
      });
    },
  });

  // 批量删除端点
  const batchDeleteEndpointMutation = useMutation({
    mutationFn: (ids: string[]) => endpointService.batchDeleteEndpoint(ids),
    onSuccess: () => {
      message.success('批量删除端点成功');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '批量删除端点失败',
        content: `批量删除端点时发生错误：${error.message || '未知错误'}。`,
      });
    },
  });

  // 删除端点
  const deleteEndpoint = (id: string) => {
    deleteEndpointMutation.mutate(id);
  };

  // 批量删除端点
  const batchDeleteEndpoint = (ids: string[]) => {
    batchDeleteEndpointMutation.mutate(ids);
  };

  // 导出端点配置
  const exportConfigMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => endpointService.exportConfig(id, name),
    onSuccess: () => {
      message.success('导出配置成功');
    },
    onError: (error) => {
      modal.error({
        title: '导出配置失败',
        content: `导出配置时发生错误：${error.message || '未知错误'}。`,
      });
    },
  });

  // 导出端点配置
  const exportConfig = (id: string, name: string) => {
    exportConfigMutation.mutate({ id, name });
  };

  // 处理模态框确认
  const handleModalSave = (values: EndpointFormData) => {
    if (currentRow?.id) {
      updateEndpointMutation.mutate({ ...values, id: currentRow.id });
    } else {
      createEndpointMutation.mutate(values);
    }
  };

  // 计算加载状态
  const isLoading =
    createEndpointMutation.isPending ||
    updateEndpointMutation.isPending ||
    deleteEndpointMutation.isPending ||
    batchDeleteEndpointMutation.isPending ||
    updateStatusMutation.isPending ||
    exportConfigMutation.isPending;

  return {
    handleModalSave,
    updateEndpointStatus,
    deleteEndpoint,
    batchDeleteEndpoint,
    exportConfig,
    isLoading,
  };
};
