import { usePermission } from '@/hooks/usePermission';

/**
 * 菜单权限相关的 hooks
 */
export const useMenuPermissions = () => {
  // 新增菜单权限
  const canAddMenu = usePermission(['system:menu:add']);
  // 编辑菜单权限
  const canEditMenu = usePermission(['system:menu:edit']);
  // 删除菜单权限
  const canDeleteMenu = usePermission(['system:menu:delete']);
  // 复制菜单权限
  const canCopyMenu = usePermission(['system:menu:copy']);
  // 导入菜单权限
  const canImportMenu = usePermission(['system:menu:import']);
  // 导出菜单权限
  const canExportMenu = usePermission(['system:menu:export']);
  // 菜单接口权限相关
  const canAddInterfacePermission = usePermission(['system:menu:interface:add']);
  const canEditInterfacePermission = usePermission(['system:menu:interface:edit']);
  const canDeleteInterfacePermission = usePermission(['system:menu:interface:delete']);

  return {
    canAddMenu,
    canEditMenu,
    canDeleteMenu,
    canCopyMenu,
    canImportMenu,
    canExportMenu,
    canAddInterfacePermission,
    canEditInterfacePermission,
    canDeleteInterfacePermission,
  };
};

