import { usePermission } from '@/hooks/usePermission';

/**
 * 用户权限相关的 hooks
 */
export const useUserPermissions = () => {
  // 重置密码权限
  const canUpdatePassword = usePermission(['sys:user:updatePassword']);
  // 分配角色权限
  const canAssignRole = usePermission(['sys:user:assignRole']);
  // 更新用户状态权限
  const canUpdateStatus = usePermission(['sys:user:updateStatus']);
  // 查看操作日志权限
  const canViewOperationLog = usePermission(['sys:user:viewOperationLog']);
  // 删除用户权限
  const canDeleteUser = usePermission(['sys:user:delete']);

  return {
    canUpdatePassword,
    canAssignRole,
    canUpdateStatus,
    canViewOperationLog,
    canDeleteUser,
  };
};
