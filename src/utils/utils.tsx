import * as Icons from '@ant-design/icons';
import React from 'react';
import { MyIcon } from '@/components/MyIcon/index';
import type { RouteItem } from '@/types/route';
import { isObject } from './is';

export type MenuEntity = RouteItem & {
  id: string;
  path: string;
  parentId?: string | null;
  children?: MenuEntity[];
};

export type MenuCaches = {
  pathMap: Map<string, MenuEntity>;
  ancestorsMap: Map<string, string[]>;
  routeToMenuPathMap: Map<string, string>;
};

/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = '';
  for (const key in obj) {
    parameters += `${key}=${encodeURIComponent(obj[key])}&`;
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}

export function deepMerge<T = object>(src: Record<string, any> = {}, target: any = {}): T {
  let key: string;
  for (key in target) {
    if (isObject(src[key])) {
      src[key] = deepMerge(src[key], target[key]);
    } else {
      src[key] = target[key];
    }
  }
  return src as T;
}

/**
 * @description 递归查询对应的路由
 * @param path 当前访问地址
 * @param routes 路由列表
 * @returns array
 */
export const searchRoute = (path: string, routes: RouteItem[] = []): RouteItem | null => {
  for (const item of routes) {
    if (item.path === path) {
      return item;
    }
    if (item.children) {
      const res = searchRoute(path, item.children);
      if (res) {
        return res;
      }
    }
  }
  return null;
};

// 动态渲染 Icon 图标(目前使用antd的图标库和自定义的图标库-iconfont)
const customIcons: { [key: string]: any } = Icons;

/**
 * 图标库
 * @param name 图表名
 */
export const getIcon = (name: string | undefined | null) => {
  if (name && name.indexOf('nexus') > -1) {
    return <MyIcon type={`${name}`} />;
  }
  return addIcon(name);
};

/**
 * 使用antd的图标库
 * @param name 图标名
 * @returns
 */
export const addIcon = (name: string | undefined | null) => {
  if (!name || !customIcons[name]) {
    return null;
  }
  return React.createElement(customIcons[name]);
};

/**
 * 将后台拿到的数据映射成包含key的数据，用于react相关组件
 * @param data 数据
 * @param key 数据中的唯一字段
 * @returns 映射的数据
 */
export const addKeyToData = (data: any[], key: string) => {
  return data.map((item) => {
    const newItem = { ...item, key: item[key] };
    if (item.children) {
      newItem.children = addKeyToData(item.children, key);
    }
    return newItem;
  });
};

/**
 * 获取快捷键的标签
 * @param shortcut 快捷键字符串
 * @returns 格式化后的快捷键标签
 */
export function getShortcutLabel(shortcut: string): string {
  const isMac = (navigator as any).userAgentData?.platform === 'macOS';
  return shortcut
    .replace('ctrl', isMac ? '⌘' : 'Ctrl')
    .replace('shift', isMac ? '⇧' : 'Shift')
    .replace('alt', isMac ? '⌥' : 'Alt')
    .replace('meta', isMac ? '⌘' : 'Meta'); // 可选;
}

/**
 * 转换树组件的数据
 * @param data 树组件的数据
 * @param expanded 展开的节点
 * @param t 国际化函数
 * @returns 转换后的数据
 */
export function transformData(data: any[], expanded: string[], t: (key: string) => string) {
  return data.map((item: any) => {
    const newItem = {
      ...item, // 先拷贝一份，避免修改原对象
      icon: item.icon ? getIcon(item.icon) : undefined,
      originalIcon: item.icon,
      name: t(item.name),
    };

    if (item.children?.length > 0) {
      expanded.push(item.id);
      newItem.children = transformData(item.children, expanded, t);
    }

    return newItem;
  });
}

/**
 * 模拟 TanStack Router 的路径匹配逻辑
 * @param routeDef 路由定义路径 (例如: /users/$userId/settings)
 * @param currentPath 实际当前路径 (例如: /users/123/settings)
 * @param exact 是否精确匹配 (默认 true，如果为 false，则 /users/$id 可以匹配 /users/123/details)
 */
export function matchPathname(routeDef: string, currentPath: string, exact = true): boolean {
  // 1. 移除末尾的斜杠并分割路径
  const cleanRoute = routeDef.replace(/\/+$/, '').split('/').filter(Boolean);
  const cleanCurrent = currentPath?.split('?')?.[0]?.replace(/\/+$/, '').split('/').filter(Boolean) ?? [];

  // 2. 如果是精确匹配，长度必须一致
  // 如果是非精确匹配（前缀匹配），实际路径长度必须大于等于定义路径
  if (exact) {
    if (cleanRoute.length !== cleanCurrent.length) {
      return false;
    }
  } else {
    if (cleanCurrent.length < cleanRoute.length) {
      return false;
    }
  }

  // 3. 逐段比对
  for (let i = 0; i < cleanRoute.length; i++) {
    const routeSegment = cleanRoute[i];
    const currentSegment = cleanCurrent[i];

    // 处理通配符 (splat routes)
    if (routeSegment === '*') {
      return true;
    }

    // 处理动态参数 ($userId)
    if (routeSegment && routeSegment.startsWith('$')) {
      continue; // 只要该位置有值，就视为匹配
    }

    // 静态段必须完全相等
    if (routeSegment !== currentSegment) {
      return false;
    }
  }

  return true;
}

/**
 * 判断路由路径是否与目标路径匹配。
 *
 * @param routePath - 路由路径
 * @param targetPath - 目标路径
 * @returns 是否匹配
 */
export const matchRoutePath = (routePath: string, targetPath: string): boolean => {
  return matchPathname(routePath, targetPath);
};

/**
 * 构建菜单缓存：
 * - pathMap：path -> 菜单实体
 * - ancestorsMap：path -> 父级 path 链（用于 openKeys）
 * - routeToMenuPathMap：路由 path -> 可见菜单 path（menuType === 3 时会用到）
 */
export function buildMenuCaches(menuList: MenuEntity[]): MenuCaches {
  const pathMap = new Map<string, MenuEntity>();
  const ancestorsMap = new Map<string, string[]>();
  const routeToMenuPathMap = new Map<string, string>();

  const dfs = (node: MenuEntity, parentVisibleAncestors: string[]) => {
    const isPureRoute = node.meta?.menuType === 2;

    // 可见菜单：自身 path 是 key；隐藏/纯路由：仅记录 pathMap 方便匹配
    pathMap.set(node.path, node);

    if (!isPureRoute && !node.hidden) {
      ancestorsMap.set(node.path, [...parentVisibleAncestors]);
    }

    if (isPureRoute) {
      // 路由节点指向最近的可见菜单
      const nearestVisible = parentVisibleAncestors[parentVisibleAncestors.length - 1];
      if (nearestVisible) {
        routeToMenuPathMap.set(node.path, nearestVisible);
      }
    }

    // 计算下一层可见菜单的父链
    const nextVisibleAncestors =
      isPureRoute || node.hidden ? parentVisibleAncestors : [...parentVisibleAncestors, node.path];

    node.children?.forEach((child) => {
      dfs(child, nextVisibleAncestors);
    });
    node.childrenRoute?.forEach((child) => {
      dfs(child as MenuEntity, nextVisibleAncestors);
    });
  };

  menuList.forEach((root) => {
    dfs(root, []);
  });

  return { pathMap, ancestorsMap, routeToMenuPathMap };
}

/**
 * 根据路径查找菜单
 * @param path 路径
 * @param caches 菜单缓存
 * @returns 找到的菜单对象或 undefined
 */
export function findMenuByPath(path: string, caches: MenuCaches): MenuEntity | undefined {
  const { pathMap } = caches;
  let entity = pathMap.get(path);
  if (!entity) {
    for (const [candidatePath, candidateEntity] of pathMap.entries()) {
      if (matchPathname(candidatePath, path)) {
        entity = candidateEntity;
        break;
      }
    }
  }
  return entity;
}
