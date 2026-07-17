/**
 * @file 接口管理左侧菜单树数据构建
 */

import type { DataNode } from 'antd/es/tree';
import type { TFunction } from 'i18next';
import type { MenuModel } from '@/shared/api/system/menu/type';
import { addIcon } from '@/shared/utils/optimized-icons';
import { CAN_ATTACH_API_MENU_TYPES } from '../constants';

/**
 * 将菜单列表转为树形数据，仅「可配置接口的菜单」可选。
 *
 * @param nodes - 菜单树
 * @param t - i18n 翻译函数
 */
function buildMenuTreeData(nodes: MenuModel[], t: TFunction): DataNode[] {
  return (nodes || []).map((node) => {
    const canSelect = CAN_ATTACH_API_MENU_TYPES.includes(node.menuType as 1 | 2) && !!node.leaf;
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

/**
 * @param menuList - 菜单树
 * @param t - i18n 翻译函数
 * @returns antd Tree `treeData`
 */
export function useMenuTreeData(menuList: MenuModel[], t: TFunction): DataNode[] {
  return buildMenuTreeData(menuList, t);
}
