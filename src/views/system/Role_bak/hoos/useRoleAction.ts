import { useMutation } from '@tanstack/react-query';
import { roleService } from '@/services/system/role/roleApi';
import type { RoleModel } from '@/services/system/role/type';

interface RoleActionProps {
  // 当前操作的行数据
  currentRow: Partial<RoleModel> | null;
  // 成功的回调
  onSuccess?: () => void;
}

/**
 * 角色操作相关方法
 */
export const useRoleAction = ({ currentRow, onSuccess }: RoleActionProps) => {
  /**
   * 新增角色
   */
  const createRoleMutation = useMutation({
    mutationFn: (values: Partial<RoleModel>) => roleService.addRole(values),
    onSuccess,
  });

  // 更新角色
  const updateRoleMutation = useMutation({
    mutationFn: (values: Partial<RoleModel>) => {
      if (!currentRow?.id) {
        throw new Error('当前行数据不存在');
      }
      return roleService.editRole({ id: currentRow.id, ...values });
    },
    onSuccess,
  });

  // 更新角色状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      roleService.changeStatus({ id, status: status === 1 }),
    onSuccess,
  });

  // 删除角色(物理删除)
  const deleteRoleMutation = useMutation({
    mutationFn: (ids: string[]) => roleService.deleteBatchRole(ids),
    onSuccess,
  });

  // 删除角色(逻辑删除)
  const logicDeleteRoleMutation = useMutation({
    mutationFn: (ids: string[]) => roleService.logicDeleteBatchRole(ids),
    onSuccess,
  });

  // 分配角色菜单权限
  const assignRoleMenusMutation = useMutation({
    mutationFn: ({ roleId, menuIds }: { roleId: string; menuIds: string[] }) =>
      roleService.assignRoleMenu(roleId, menuIds),
    onSuccess,
  });

  // 分配角色用户
  const assignRoleUsersMutation = useMutation({
    mutationFn: ({ roleId, userIds, operate }: { roleId: string; userIds: string[]; operate: string }) =>
      roleService.assignRoleUser(roleId, userIds, operate),
    onSuccess,
  });

  // modal保存处理
  const handleModalSave = (values: Partial<RoleModel>) => {
    if (currentRow?.id) {
      updateRoleMutation.mutate(values);
    } else {
      createRoleMutation.mutate(values);
    }
  };

  return {
    handleModalSave,
    updateStatusMutation,
    deleteRoleMutation,
    logicDeleteRoleMutation,
    assignRoleMenusMutation,
    assignRoleUsersMutation,
  };
};
