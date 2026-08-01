/**
 * @file 菜单按钮配置权限开关
 */

import { usePermission } from '@/shared/hooks/usePermission';

/**
 * 菜单按钮配置权限开关集合（按钮即 permType=1 权限点，复用权限点管理权限码）。
 */
export interface MenuButtonPermissions {
  /** 是否可新增按钮（`system:permission:add`） */
  canAdd: boolean;
  /** 是否可编辑/启停按钮（`system:permission:edit`） */
  canEdit: boolean;
  /** 是否可删除按钮（`system:permission:delete`） */
  canDelete: boolean;
}

/**
 * 汇总菜单按钮配置用到的权限。
 *
 * @returns 各操作权限布尔值
 */
export function useMenuButtonPermissions(): MenuButtonPermissions {
  const canAdd = usePermission(['system:permission:add']);
  const canEdit = usePermission(['system:permission:edit']);
  const canDelete = usePermission(['system:permission:delete']);

  return { canAdd, canEdit, canDelete };
}
