import { usePermission } from '@/hooks/usePermission';

/**
 * 权限点模块权限相关的 hooks
 */
export const usePermissionPermissions = () => {
  // 新增权限
  const canAdd = usePermission(['sys:permission:add']);
  // 编辑权限
  const canEdit = usePermission(['sys:permission:edit']);
  // 删除权限
  const canDelete = usePermission(['sys:permission:delete']);
  // 更新状态权限
  const canUpdateStatus = usePermission(['sys:permission:updateStatus']);
  // 批量导入权限
  const canImport = usePermission(['sys:permission:import']);
  // 批量导出权限
  const canExport = usePermission(['sys:permission:export']);

  return {
    canAdd,
    canEdit,
    canDelete,
    canUpdateStatus,
    canImport,
    canExport,
  };
};
