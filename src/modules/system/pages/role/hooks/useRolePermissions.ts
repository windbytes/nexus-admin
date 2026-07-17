/**
 * @file 角色管理权限开关
 */

import { usePermission } from '@/shared/hooks/usePermission';

/**
 * 角色管理页权限开关集合。
 */
export interface RolePermissions {
  canAddRole: boolean;
  canEditRole: boolean;
  canDeleteRole: boolean;
  canAssignMenu: boolean;
  canAssignPermission: boolean;
  canAssignUser: boolean;
  canImportRole: boolean;
  canExportRole: boolean;
}

/**
 * 汇总角色管理页用到的按钮权限。
 *
 * @returns 各操作权限布尔值
 */
export function useRolePermissions(): RolePermissions {
  const canAddRole = usePermission(['sys:role:add']);
  const canEditRole = usePermission(['sys:role:edit']);
  const canDeleteRole = usePermission(['sys:role:delete']);
  const canAssignMenu = usePermission(['sys:role:assignMenu']);
  const canAssignPermission = usePermission(['sys:role:assignPermission']);
  const canAssignUser = usePermission(['sys:role:assignUser']);
  const canImportRole = usePermission(['sys:role:import']);
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
}
