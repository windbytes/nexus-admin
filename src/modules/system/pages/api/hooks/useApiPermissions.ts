/**
 * @file 系统接口管理权限开关
 */

import { usePermission } from '@/shared/hooks/usePermission';

/**
 * 接口管理页权限开关集合。
 */
export interface ApiPermissions {
  /** 是否可新增（`system:api:add`） */
  canAdd: boolean;
  /** 是否可编辑（`system:api:update`） */
  canUpdate: boolean;
  /** 是否可删除（`system:api:delete`） */
  canDelete: boolean;
  /** 是否可批量删除（`system:api:batchDelete`） */
  canBatchDelete: boolean;
}

/**
 * 汇总接口管理页用到的按钮权限。
 *
 * @returns 各操作权限布尔值
 */
export function useApiPermissions(): ApiPermissions {
  const canAdd = usePermission(['system:api:add']);
  const canUpdate = usePermission(['system:api:update']);
  const canDelete = usePermission(['system:api:delete']);
  const canBatchDelete = usePermission(['system:api:batchDelete']);

  return {
    canAdd,
    canUpdate,
    canDelete,
    canBatchDelete,
  };
}
