import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { permissionService } from '@/services/system/permission';
import type {
  PermissionModel,
  PermissionResourceModel,
  SavePermissionRequest,
} from '@/services/system/permission/type';

interface UsePermissionActionsProps {
  // 当前操作的行数据
  currentRow: Partial<PermissionModel> | null;
  // 成功的回调
  onSuccess?: () => void;
}

/**
 * 权限点操作相关的 hooks
 */
export const usePermissionActions = ({ currentRow, onSuccess }: UsePermissionActionsProps) => {
  const { message } = App.useApp();

  /**
   * 更新权限点状态
   */
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      permissionService.updatePermissionStatus(id, status),
    onSuccess: () => {
      message.success('更新状态成功');
      onSuccess?.();
    },
  });

  /**
   * 删除权限点
   */
  const deletePermissionMutation = useMutation({
    mutationFn: (id: string) => permissionService.deletePermission(id),
    onSuccess: () => {
      message.success('删除权限点成功');
      onSuccess?.();
    },
  });

  /**
   * 批量删除权限点
   */
  const deletePermissionsMutation = useMutation({
    mutationFn: (ids: string[]) => permissionService.deletePermissions(ids),
    onSuccess: () => {
      message.success('批量删除权限点成功');
      onSuccess?.();
    },
  });

  /**
   * 绑定权限资源
   */
  const bindResourcesMutation = useMutation({
    mutationFn: ({ permissionId, resources }: { permissionId: string; resources: PermissionResourceModel[] }) =>
      permissionService.bindPermissionResources(permissionId, resources),
    onSuccess: () => {
      message.success('绑定资源成功');
      onSuccess?.();
    },
  });

  /**
   * 保存权限点（统一接口，包含基础信息和资源绑定）
   */
  const savePermissionMutation = useMutation({
    mutationFn: (request: SavePermissionRequest) => permissionService.savePermission(request),
    onSuccess: () => {
      const actionText = currentRow?.id ? '更新' : '新增';
      message.success(`${actionText}权限点成功`);
      onSuccess?.();
    },
  });

  /**
   * 更改权限点状态
   */
  const updatePermissionStatus = (id: string, status: number) => {
    updateStatusMutation.mutate({ id, status });
  };

  /**
   * 删除权限点
   */
  const deletePermission = (id: string) => {
    deletePermissionMutation.mutate(id);
  };

  /**
   * 批量删除权限点
   */
  const deletePermissions = (ids: string[]) => {
    deletePermissionsMutation.mutate(ids);
  };

  /**
   * 绑定权限资源
   */
  const bindResources = (permissionId: string, resources: PermissionResourceModel[]) => {
    bindResourcesMutation.mutate({ permissionId, resources });
  };

  /**
   * 保存权限点（统一接口）
   */
  const savePermission = (request: SavePermissionRequest) => {
    savePermissionMutation.mutate(request);
  };

  return {
    updatePermissionStatus,
    deletePermission,
    deletePermissions,
    bindResources,
    savePermission,
  };
};
