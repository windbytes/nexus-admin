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
  /** 是否可统一授权（`system:role:assignPermission`） */
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
  const canAddRole = usePermission(['system:role:add']);
  const canEditRole = usePermission(['system:role:edit']);
  const canDeleteRole = usePermission(['system:role:delete']);
  const canAssignPermission = usePermission(['system:role:assignPermission']);
  const canAssignUser = usePermission(['system:role:assignUser']);
  const canImportRole = usePermission(['system:role:import']);
  const canExportRole = usePermission(['system:role:export']);

  return {
    canAddRole,
    canEditRole,
    canDeleteRole,
    canAssignPermission,
    canAssignUser,
    canImportRole,
    canExportRole,
  };
}
