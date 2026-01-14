import { usePermission } from '@/hooks/usePermission';

/**
 * 角色权限相关逻辑
 */
export const useRolePermissions = () => {
  // 新增角色权限
  const canAddRole = usePermission(['sys:role:add']);
  // 编辑角色权限
  const canEditRole = usePermission(['sys:role:edit']);
  // 删除角色权限
  const canDeleteRole = usePermission(['sys:role:delete']);
  // 分配菜单权限
  const canAssignMenu = usePermission(['sys:role:assignMenu']);
  // 分配权限点权限
  const canAssignPermission = usePermission(['sys:role:assignPermission']);
  // 分配用户权限
  const canAssignUser = usePermission(['sys:role:assignUser']);
  // 导入角色权限
  const canImportRole = usePermission(['sys:role:import']);
  // 导出角色权限
  const canExportRole = usePermission(['sys:role:export']);

  return {
    canAddRole,
    canEditRole,
    canDeleteRole,
    canAssignMenu,
    canAssignPermission,
    canAssignUser,
    canImportRole,
    canExportRole,
  };
};
