import { usePermission } from '@/shared/hooks/usePermission';

/**
 * 菜单管理页权限开关集合。
 */
export interface MenuPermissions {
  /** 是否可新增菜单（`system:menu:add`） */
  canAddMenu: boolean;
  /** 是否可编辑 / 切换状态（`system:menu:edit`） */
  canEditMenu: boolean;
  /** 是否可删除（`system:menu:delete`） */
  canDeleteMenu: boolean;
  /** 是否可复制（`system:menu:copy`） */
  canCopyMenu: boolean;
  /** 是否可导入（`system:menu:import`） */
  canImportMenu: boolean;
  /** 是否可导出（`system:menu:export`） */
  canExportMenu: boolean;
}

/**
 * 汇总菜单管理页用到的按钮权限。
 *
 * @returns 各操作权限布尔值，供按钮 `disabled` / 显隐控制
 */
export function useMenuPermissions(): MenuPermissions {
  const canAddMenu = usePermission(['system:menu:add']);
  const canEditMenu = usePermission(['system:menu:edit']);
  const canDeleteMenu = usePermission(['system:menu:delete']);
  const canCopyMenu = usePermission(['system:menu:copy']);
  const canImportMenu = usePermission(['system:menu:import']);
  const canExportMenu = usePermission(['system:menu:export']);

  return {
    canAddMenu,
    canEditMenu,
    canDeleteMenu,
    canCopyMenu,
    canImportMenu,
    canExportMenu,
  };
}
