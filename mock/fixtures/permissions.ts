/** SUPER_ADMIN 与后端 PermissionServiceImpl 一致返回通配权限 */

export const SUPER_ADMIN_PERMISSIONS = ['*'] as const;

/** 来源节选：syndra/database/postgresql/system/sys_permission.sql */
export const SAMPLE_BUTTON_PERMISSIONS = [
  'sys:user:add',
  'sys:user:edit',
  'sys:user:delete',
  'sys:user:assignRole',
  'sys:role:add',
  'sys:role:edit',
  'sys:role:delete',
  'sys:role:assignMenu',
  'system:menu:add',
] as const;

export function getButtonPermissionsByRoleCode(roleCode: string): string[] {
  if (roleCode === 'SUPER_ADMIN') {
    return [...SUPER_ADMIN_PERMISSIONS];
  }
  return [...SAMPLE_BUTTON_PERMISSIONS];
}

export function getButtonPermissionsByRoleId(roleId: string): string[] {
  if (roleId === '235123826202185723') {
    return [...SUPER_ADMIN_PERMISSIONS];
  }
  return [...SAMPLE_BUTTON_PERMISSIONS];
}
