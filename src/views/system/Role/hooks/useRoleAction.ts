import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { roleService } from '@/services/system/role/roleApi';
import type { RoleModel } from '@/services/system/role/type';

interface UseRoleActionsProps {
  // 当前操作的行数据
  currentRow: Partial<RoleModel> | null;
  // 成功的回调
  onSuccess?: () => void;
}

/**
 * 角色操作相关的 hooks
 */
export const useRoleActions = ({ currentRow, onSuccess }: UseRoleActionsProps) => {
  const { modal, message } = App.useApp();

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
    mutationFn: ({ id, status }: { id: string; status: boolean }) => roleService.changeStatus({ id, status }),
    onSuccess,
  });

  // 更新角色状态
  const updateRoleStatus = (id: string, status: boolean) => {
    updateStatusMutation.mutate({ id, status });
  };

  // 逻辑删除角色
  const deleteRolesMutation = useMutation({
    mutationFn: (ids: string[]) => roleService.logicDeleteBatchRole(ids),
    onSuccess,
  });

  // 批量删除角色
  const deleteRoles = (ids: string[]) => {
    deleteRolesMutation.mutate(ids);
  };

  // 分配角色菜单权限
  const assignRoleMenusMutation = useMutation({
    mutationFn: ({ roleId, menuIds }: { roleId: string; menuIds: string[] }) =>
      roleService.assignRoleMenu(roleId, menuIds),
    onSuccess: () => {
      message.success('分配菜单权限成功');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '分配菜单权限失败',
        content: error.message,
      });
    },
  });

  // 分配角色用户
  const assignRoleUsersMutation = useMutation({
    mutationFn: ({ roleId, userIds, operate }: { roleId: string; userIds: string[]; operate: string }) =>
      roleService.assignRoleUser(roleId, userIds, operate),
    onSuccess: () => {
      message.success('分配用户成功');
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '分配用户失败',
        content: error.message,
      });
    },
  });

  // 分配角色权限点（授权资源/授权权限确定时调用，全量覆盖）
  const assignRolePermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      roleService.assignRolePermission(roleId, permissionIds),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      modal.error({
        title: '保存失败',
        content: error.message,
      });
    },
  });

  // 处理模态框确认
  const handleModalSave = (values: Partial<RoleModel>) => {
    if (currentRow?.id) {
      updateRoleMutation.mutate(values);
    } else {
      createRoleMutation.mutate(values);
    }
  };

  return {
    handleModalSave,
    updateRoleStatus,
    deleteRoles,
    assignRoleMenusMutation,
    assignRoleUsersMutation,
    assignRolePermissionsMutation,
  };
};
