import { usePermission } from '@/hooks/usePermission';

/**
 * 系统参数权限相关的 hooks
 */
export const useParamPermissions = () => {
  // 查看权限
  const canView = usePermission(['sys:param:view']);
  // 新增权限
  const canAdd = usePermission(['sys:param:create']);
  // 编辑权限
  const canEdit = usePermission(['sys:param:update']);
  // 删除权限
  const canDelete = usePermission(['sys:param:delete']);
  // 批量删除权限
  const canBatchDelete = usePermission(['sys:param:delete']);
  // 导入权限
  const canImport = usePermission(['sys:param:import']);
  // 导出权限
  const canExport = usePermission(['sys:param:export']);

  return {
    canView,
    canAdd,
    canEdit,
    canDelete,
    canBatchDelete,
    canImport,
    canExport,
  };
};
