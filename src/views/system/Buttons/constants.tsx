import type { DataNode } from 'antd/es/tree';
import type { TFunction } from 'i18next';
import type { MenuModel } from '@/services/system/menu/type';
import { addIcon } from '@/utils/optimized-icons';

/** 可挂按钮的菜单：menu_type in (1,2) 且 is_leaf = true */
export const CAN_ATTACH_BUTTON_MENU_TYPES = [1, 2] as const;

/**
 * 将菜单列表转为树形数据，仅「可挂按钮的菜单」可选
 */
export function buildMenuTreeData(nodes: MenuModel[], t: TFunction): DataNode[] {
  return (nodes || []).map((node) => {
    const canSelect = CAN_ATTACH_BUTTON_MENU_TYPES.includes(node.menuType as 1 | 2) && !!node.leaf;
    return {
      key: node.id,
      title: (
        <span>
          {node.icon ? addIcon(node.icon) : ''} {t(node.name)}
        </span>
      ),
      selectable: canSelect,
      children: node.children?.length ? buildMenuTreeData(node.children, t) : undefined,
    };
  });
}
