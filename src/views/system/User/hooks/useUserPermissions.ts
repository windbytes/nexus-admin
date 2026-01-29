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
  const canViewActionLog = usePermission(['sys:user:viewActionLog']);
  // 删除用户权限
  const canDeleteUser = usePermission(['sys:user:delete']);
  // 编辑权限
  const canEdit = usePermission(['sys:user:edit']);
  // 新增权限
  const canAdd = usePermission(['sys:user:add']);
  // 批量导入权限
  const canBatchImport = usePermission(['sys:user:import']);
  // 批量导出权限
  const canBatchExport = usePermission(['sys:user:export']);
  // 恢复用户权限
  const canRecover = usePermission(['sys:user:recover']);
  // 批量重置密码权限
  const canBatchResetPassword = usePermission(['sys:user:resetPassword']);
  // 批量分配角色权限
  const canBatchAssignRole = usePermission(['sys:user:assignRole']);

  return {
    canUpdatePassword,
    canAssignRole,
    canUpdateStatus,
    canViewActionLog,
    canDeleteUser,
    canAdd,
    canEdit,
    canBatchImport,
    canBatchExport,
    canRecover,
    canBatchResetPassword,
    canBatchAssignRole,
  };
};
