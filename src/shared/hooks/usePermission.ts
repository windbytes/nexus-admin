import { useMenuStore } from '@/shared/stores/preferences.store';

/**
 * 基于当前登录用户按钮权限码，判断是否具备指定权限。
 *
 * 权限数据来源：`useMenuStore().buttonPermissions`（登录确认角色后写入）。
 * 若权限列表为 `['*']`，视为超级权限，直接返回 `true`。
 *
 * @param requiredPermissions - 需要校验的权限码数组，例如 `['system:menu:add']`
 * @param mode - 匹配模式：
 *   - `'OR'`（默认）：任一权限命中即通过
 *   - `'AND'`：全部权限都需命中才通过
 * @returns 是否具备权限
 *
 * @example
 * ```ts
 * const canAdd = usePermission(['system:menu:add']);
 * const canManage = usePermission(['system:menu:edit', 'system:menu:delete'], 'AND');
 * ```
 */
export function usePermission(requiredPermissions: string[], mode: 'AND' | 'OR' = 'OR'): boolean {
  const { buttonPermissions } = useMenuStore();
  if (buttonPermissions.length === 1 && buttonPermissions[0] === '*') {
    return true;
  }
  const permissionSet = new Set(buttonPermissions);
  if (mode === 'AND') {
    return requiredPermissions.every((perm) => permissionSet.has(perm));
  }
  return requiredPermissions.some((perm) => permissionSet.has(perm));
}
