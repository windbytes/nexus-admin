import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { permissionService } from '@/services/system/permission/permissionApi';
import type { PermissionModel } from '@/services/system/permission/type';

interface UsePermissionActionsProps {
  /** 当前操作的行数据 */
  currentRow: Partial<PermissionModel> | null;
  /** 成功的回调 */
  onSuccess?: () => void;
}

/**
 * 权限点操作相关的 hooks
 */
export const usePermissionActions = ({ currentRow, onSuccess }: UsePermissionActionsProps) => {
  const { modal, message } = App.useApp();

  /**
   * 创建权限点
   */
  const createMutation = useMutation({
    mutationFn: (values: Partial<PermissionModel>) => permissionService.createPermission(values),
    onSuccess: () => {
      message.success('创建权限点成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '创建权限点失败',
        content: error.message,
      });
    },
  });

  /**
   * 更新权限点
   */
  const updateMutation = useMutation({
    mutationFn: (values: Partial<PermissionModel>) => {
      if (!currentRow?.id) {
        throw new Error('当前行数据不存在');
      }
      return permissionService.updatePermission({ id: currentRow.id, ...values });
    },
    onSuccess: () => {
      message.success('更新权限点成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '更新权限点失败',
        content: error.message,
      });
    },
  });

  /**
   * 批量更新状态
   */
  const updateStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: boolean }) =>
      permissionService.updateBatchStatus(ids, status),
    onSuccess: () => {
      message.success('更新状态成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '更新状态失败',
        content: error.message,
      });
    },
  });

  /**
   * 删除权限点
   */
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => permissionService.deletePermissions(ids),
    onSuccess: () => {
      message.success('删除权限点成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '删除权限点失败',
        content: error.message,
      });
    },
  });

  /**
   * 更新权限点状态
   */
  const updateStatus = (ids: string[], status: boolean) => {
    updateStatusMutation.mutate({ ids, status });
  };

  /**
   * 删除权限点
   */
  const deletePermissions = (ids: string[]) => {
    deleteMutation.mutate(ids);
  };

  /**
   * 处理模态框保存
   */
  const handleModalSave = (values: Partial<PermissionModel>) => {
    if (currentRow?.id) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return {
    handleModalSave,
    updateStatus,
    deletePermissions,
    isLoading: createMutation.isPending || updateMutation.isPending,
  };
};
