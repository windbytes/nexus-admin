import type { Key, ReactNode } from 'react';

import type { MenuProps } from 'antd';
import type { TFunction } from 'i18next';

import type { RouteItem } from '@/types/route';
import { getIcon } from '@/utils/optimized-icons';
import { getOpenKeys } from '@/utils/utils';

export type MenuItem = Required<MenuProps>['items'][number];

export type MenuState = {
  selectedKeys: string[];
  computedOpenKeys: string[];
  openKeys: string[];
  userInteracted: boolean;
};

export type MenuAction =
  | { type: 'sync'; selectedKeys: string[]; computedOpenKeys: string[] }
  | { type: 'user-open-change'; openKeys: string[] }
  | { type: 'reset-interaction' };

/**
 * 浅比较两个字符串数组是否相等。
 *
 * @param a - 第一个数组
 * @param b - 第二个数组
 * @returns 两个数组引用或内容一致时返回 true
 */
export const shallowEqualKeys = (a: string[], b: string[]) => {
  if (a === b) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) {
      return false;
    }
  }

  return true;
};

/**
 * 处理菜单相关状态的 reducer，负责合并路由同步与用户交互产生的状态变化。
 *
 * @param state - 当前菜单状态
 * @param action - 触发的状态更新动作
 * @returns 更新后的菜单状态
 */
export const menuStateReducer = (state: MenuState, action: MenuAction): MenuState => {
  switch (action.type) {
    case 'sync': {
      const selectedKeys = shallowEqualKeys(state.selectedKeys, action.selectedKeys)
        ? state.selectedKeys
        : action.selectedKeys;

      const computedOpenKeys = shallowEqualKeys(state.computedOpenKeys, action.computedOpenKeys)
        ? state.computedOpenKeys
        : action.computedOpenKeys;

      const shouldOverrideOpenKeys = !state.userInteracted;
      const openKeys = shouldOverrideOpenKeys
        ? shallowEqualKeys(state.openKeys, action.computedOpenKeys)
          ? state.openKeys
          : action.computedOpenKeys
        : state.openKeys;

      if (
        selectedKeys === state.selectedKeys &&
        computedOpenKeys === state.computedOpenKeys &&
        openKeys === state.openKeys &&
        state.userInteracted === false
      ) {
        return state;
      }

      return {
        selectedKeys,
        computedOpenKeys,
        openKeys,
        userInteracted: false,
      };
    }
    case 'user-open-change': {
      if (shallowEqualKeys(state.openKeys, action.openKeys) && state.userInteracted) {
        return state;
      }

      if (shallowEqualKeys(state.openKeys, action.openKeys) && !state.userInteracted) {
        return {
          ...state,
          userInteracted: true,
        };
      }

      return {
        ...state,
        openKeys: action.openKeys,
        userInteracted: true,
      };
    }
    case 'reset-interaction': {
      if (!state.userInteracted) {
        return state;
      }
      return {
        ...state,
        userInteracted: false,
      };
    }
    default:
      return state;
  }
};

/**
 * 根据当前路径和菜单数据生成初始的菜单状态。
 *
 * @param pathname - 当前路由路径
 * @param menus - 当前可用的菜单数据
 * @returns 初始菜单状态
 */
export const createInitialMenuState = (pathname: string, menus?: RouteItem[]): MenuState => {
  const initialOpenKeys = getOpenKeys(pathname, menus);
  return {
    selectedKeys: [pathname],
    computedOpenKeys: initialOpenKeys,
    openKeys: initialOpenKeys,
    userInteracted: false,
  };
};

/**
 * 构建符合 antd Menu API 规范的菜单项。
 *
 * @param t - 国际化方法
 * @param label - 菜单标题 key
 * @param key - 菜单唯一标识
 * @param icon - 菜单图标
 * @param children - 子菜单项
 * @param type - 菜单项类型
 * @returns antd `Menu` 可识别的菜单项配置
 */
export const getItem = (
  t: TFunction,
  label: unknown,
  key?: Key | null,
  icon?: ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem => {
  return {
    key,
    icon,
    children,
    label: t(label as string),
    type,
  } as MenuItem;
};

/**
 * 递归构建菜单项，过滤掉非展示类菜单。
 *
 * @param menuList - 路由菜单列表
 * @param t - 国际化方法
 * @returns antd `Menu` 使用的菜单数据
 */
export const buildMenuItems = (menuList: RouteItem[], t: TFunction): MenuItem[] => {
  const result: MenuItem[] = [];

  for (const item of menuList) {
    if (item?.meta?.menuType === 2 || item?.meta?.menuType === 3 || item?.hidden) {
      continue;
    }

    if (!item?.children?.length) {
      result.push(getItem(t, item.meta?.title, item.path, getIcon(item.meta?.icon)));
      continue;
    }

    result.push(getItem(t, item.meta?.title, item.path, getIcon(item.meta?.icon), buildMenuItems(item.children, t)));
  }

  return result;
};

/**
 * 判断菜单是否需要展示。
 *
 * @param menu - 菜单项
 * @returns true 表示菜单可见
 */
export const isVisibleMenu = (menu: RouteItem) => {
  return !(menu.hidden || menu.meta?.menuType === 2 || menu.meta?.menuType === 3);
};

/**
 * 检查目标路径是否存在于给定的路由列表（含子级）。
 *
 * @param routes - 路由列表
 * @param targetPath - 目标路径
 * @returns 是否包含目标路径
 */
export const hasRoutePath = (routes: RouteItem[] | undefined, targetPath: string): boolean => {
  if (!routes || routes.length === 0) {
    return false;
  }

  for (const route of routes) {
    if (route.path === targetPath) {
      return true;
    }

    if (hasRoutePath(route.children, targetPath)) {
      return true;
    }

    if (hasRoutePath(route.childrenRoute, targetPath)) {
      return true;
    }
  }

  return false;
};

/**
 * 查找距离目标路径最近的可见菜单路径，用于同步选中状态。
 *
 * @param menuList - 路由菜单列表
 * @param targetPath - 目标路径
 * @returns 匹配到的菜单路径，未找到则返回 null
 */
export const findNearestVisibleMenuPath = (menuList: RouteItem[], targetPath: string): string | null => {
  for (const menu of menuList) {
    if (!isVisibleMenu(menu)) {
      continue;
    }

    if (menu.path === targetPath) {
      return menu.path;
    }

    if (menu.children && menu.children.length > 0) {
      const childMatch = findNearestVisibleMenuPath(menu.children, targetPath);
      if (childMatch) {
        return childMatch;
      }
    }

    if (hasRoutePath(menu.childrenRoute, targetPath)) {
      return menu.path;
    }
  }

  return null;
};
