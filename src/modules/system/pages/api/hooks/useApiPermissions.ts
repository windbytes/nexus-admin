/**
 * @file 系统接口管理权限开关
 */

import { usePermission } from '@/shared/hooks/usePermission';

/**
 * 接口管理页权限开关集合（含注册表操作与左侧权限点分组操作）。
 */
export interface ApiPermissions {
  /** 是否可新增注册项（`system:api:add`） */
  canAdd: boolean;
  /** 是否可编辑注册项（`system:api:update`） */
  canEdit: boolean;
  /** 是否可删除注册项（`system:api:delete`） */
  canDelete: boolean;
  /** 是否可批量删除注册项（`system:api:batchDelete`） */
  canBatchDelete: boolean;
  /** 是否可扫描同步（`system:api:scan`） */
  canScan: boolean;
  /** 是否可新增权限点分组（`system:permission:add`） */
  canAddGroup: boolean;
  /** 是否可编辑权限点分组（`system:permission:edit`） */
  canEditGroup: boolean;
  /** 是否可删除权限点分组（`system:permission:delete`） */
  canDeleteGroup: boolean;
}

/**
 * 汇总接口管理页用到的按钮权限。
 *
 * @returns 各操作权限布尔值
 */
export function useApiPermissions(): ApiPermissions {
  const canAdd = usePermission(['system:api:add']);
  const canEdit = usePermission(['system:api:update']);
  const canDelete = usePermission(['system:api:delete']);
  const canBatchDelete = usePermission(['system:api:batchDelete']);
  const canScan = usePermission(['system:api:scan']);
  const canAddGroup = usePermission(['system:permission:add']);
  const canEditGroup = usePermission(['system:permission:edit']);
  const canDeleteGroup = usePermission(['system:permission:delete']);

  return {
    canAdd,
    canEdit,
    canDelete,
    canBatchDelete,
    canScan,
    canAddGroup,
    canEditGroup,
    canDeleteGroup,
  };
}
