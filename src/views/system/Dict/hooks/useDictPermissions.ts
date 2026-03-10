import { usePermission } from '@/hooks/usePermission';

/**
 * 数据字典权限 hooks（与后端 sys:dict:* 对应）
 */
export const useDictPermissions = () => {
  const canAdd = usePermission(['sys:dict:add']);
  const canEdit = usePermission(['sys:dict:edit']);
  const canDelete = usePermission(['sys:dict:delete']);
  const canImport = usePermission(['sys:dict:import']);
  const canExport = usePermission(['sys:dict:export']);

  return { canAdd, canEdit, canDelete, canImport, canExport };
};
