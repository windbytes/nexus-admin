import { usePermission } from '@/hooks/usePermission';

/**
 * 用户权限相关的 hooks
 */
export const useUserPermissions = () => {
  const canUpdatePassword = usePermission(['sys:user:updatePassword']);
  const canAssignRole = usePermission(['sys:user:assignRole']);
  const canUpdateStatus = usePermission(['sys:user:updateStatus']);
  const canViewOperationLog = usePermission(['sys:user:viewOperationLog']);
  const canDeleteUser = usePermission(['sys:user:delete']);

  return {
    canUpdatePassword,
    canAssignRole,
    canUpdateStatus,
    canViewOperationLog,
    canDeleteUser,
  };
};
