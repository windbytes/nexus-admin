/**
 * @file 角色 CRUD / 授权 mutations
 */

import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { roleService } from '@/modules/system/api/role';
import type { RoleModel } from '@/shared/api/system/role/type';

interface UseRoleActionsProps {
  /** 当前操作的行数据 */
  currentRow: Partial<RoleModel> | null;
  /** 成功回调 */
  onSuccess?: () => void;
}

/**
 * 角色操作相关 hooks。
 *
 * @param props - 当前行与成功回调
 */
export function useRoleActions({ currentRow, onSuccess }: UseRoleActionsProps) {
  const { modal, message } = App.useApp();

  const createRoleMutation = useMutation({
    mutationFn: (values: Partial<RoleModel>) => roleService.addRole(values),
    onSuccess,
  });

  const updateRoleMutation = useMutation({
    mutationFn: (values: Partial<RoleModel>) => {
      if (!currentRow?.id) {
        throw new Error('当前行数据不存在');
      }
      return roleService.editRole({ id: currentRow.id, ...values });
    },
    onSuccess,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) => roleService.changeStatus({ id, status }),
    onSuccess,
  });

  /**
   * @param id - 角色主键
   * @param status - 目标状态
   */
  function updateRoleStatus(id: string, status: boolean) {
    updateStatusMutation.mutate({ id, status });
  }

  const deleteRolesMutation = useMutation({
    mutationFn: (ids: string[]) => roleService.logicDeleteBatchRole(ids),
    onSuccess,
  });

  /**
   * @param ids - 角色主键列表
   */
  function deleteRoles(ids: string[]) {
    deleteRolesMutation.mutate(ids);
  }

  const assignRoleMenusMutation = useMutation({
    mutationFn: ({ roleId, menuIds }: { roleId: string; menuIds: string[] }) =>
      roleService.assignRoleMenu(roleId, menuIds),
    onSuccess: () => {
      message.success('分配菜单权限成功');
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '分配菜单权限失败',
        content: error.message,
      });
    },
  });

  /** 分配角色权限点（授权资源/授权权限确定时调用，全量覆盖） */
  const assignRolePermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      roleService.assignRolePermission(roleId, permissionIds),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: Error) => {
      modal.error({
        title: '保存失败',
        content: error.message,
      });
    },
  });

  /**
   * @param values - 表单提交值
   */
  function handleModalSave(values: Partial<RoleModel>) {
    if (currentRow?.id) {
      updateRoleMutation.mutate(values);
    } else {
      const { id: _omitId, ...payload } = values;
      createRoleMutation.mutate(payload);
    }
  }

  return {
    handleModalSave,
    updateRoleStatus,
    deleteRoles,
    assignRoleMenusMutation,
    assignRolePermissionsMutation,
  };
}
