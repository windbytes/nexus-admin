/**
 * @file 角色 CRUD / 授权 mutations
 */

import { useMutation } from '@tanstack/react-query';
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
  };
}
