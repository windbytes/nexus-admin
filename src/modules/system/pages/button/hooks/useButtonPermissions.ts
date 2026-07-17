/**
 * @file 页面按钮管理权限开关
 */

import { usePermission } from '@/shared/hooks/usePermission';

/**
 * 按钮管理页权限开关集合。
 */
export interface ButtonPermissions {
  /** 是否可新增（`system:button:add`） */
  canAdd: boolean;
  /** 是否可编辑（`system:button:update`） */
  canUpdate: boolean;
  /** 是否可删除（`system:button:delete`） */
  canDelete: boolean;
  /** 是否可批量删除（`system:button:batchDelete`） */
  canBatchDelete: boolean;
  /** 是否可切换状态（`system:button:toggleStatus`） */
  canToggleStatus: boolean;
}

/**
 * 汇总按钮管理页用到的按钮权限。
 *
 * @returns 各操作权限布尔值
 */
export function useButtonPermissions(): ButtonPermissions {
  const canAdd = usePermission(['system:button:add']);
  const canUpdate = usePermission(['system:button:update']);
  const canDelete = usePermission(['system:button:delete']);
  const canBatchDelete = usePermission(['system:button:batchDelete']);
  const canToggleStatus = usePermission(['system:button:toggleStatus']);

  return {
    canAdd,
    canUpdate,
    canDelete,
    canBatchDelete,
    canToggleStatus,
  };
}
