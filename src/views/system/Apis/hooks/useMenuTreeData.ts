import type { DataNode } from 'antd/es/tree';
import type { MenuModel } from '@/services/system/menu/type';
import { CAN_ATTACH_API_MENU_TYPES } from '../constants';

/**
 * 将菜单列表转为树形数据，仅「可配置接口的菜单」可选
 */
function buildMenuTreeData(nodes: MenuModel[]): DataNode[] {
  return (nodes || []).map((node) => {
    const title =
      node.componentName && node.componentName !== node.name
        ? `${node.name}（${node.componentName}）`
        : node.name;
    const canSelect =
      CAN_ATTACH_API_MENU_TYPES.includes(node.menuType as 1 | 2) && !!node.leaf;
    return {
      key: node.id,
      title,
      selectable: canSelect,
      children: node.children?.length ? buildMenuTreeData(node.children) : undefined,
    };
  });
}

export function useMenuTreeData(menuList: MenuModel[]): DataNode[] {
  return buildMenuTreeData(menuList);
}
