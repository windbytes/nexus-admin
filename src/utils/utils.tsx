import type { RouteItem } from '@/types/route';
import { isObject } from './is';
import { getIcon as getOptimizedIcon } from './optimized-icons';

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
 * 菜单项在侧栏中使用的稳定 key（与 path 可能为空的一级菜单兼容）
 * 用于 ancestorsMap、Menu openKeys 与菜单项 key 一致，保证刷新后父级能正确展开
 */
export function getMenuKey(node: { path?: string; id?: string; redirect?: string }): string {
  const path = node.path?.trim();
  if (path) return path;
  if (node.id) return String(node.id);
  const redirect = node.redirect?.trim();
  if (redirect) return redirect;
  return String(node.id ?? '');
}

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

/** 用于 getFirstMenuPath 的菜单节点类型（仅需 path/route/children） */
type MenuNodeForFirstPath = { path?: string; route?: boolean; children?: MenuNodeForFirstPath[] };

/**
 * 从菜单树中取第一个「路由」项（与登录选角色时首页逻辑一致）
 * @param menus 菜单树
 * @returns 第一个 route 为 true 的菜单 path，若无则 null
 */
export function getFirstMenuPath(menus: MenuNodeForFirstPath[]): string | null {
  for (const menu of menus) {
    if (menu.route && menu.path?.trim()) {
      return menu.path.trim();
    }
    if (menu.children?.length) {
      const found = getFirstMenuPath(menu.children);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 图标库
 * @param name 图表名
 */
export const getIcon = (name: string | undefined | null) => {
  return getOptimizedIcon(name);
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
    if (routeSegment?.startsWith('$')) {
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
    const menuKey = getMenuKey(node);

    // pathMap 仅用 path 注册，供 pathname 匹配；有 path 的节点才参与路径查找
    if (node.path?.trim()) {
      pathMap.set(node.path.trim(), node);
    }

    if (!isPureRoute && !node.hidden) {
      ancestorsMap.set(menuKey, [...parentVisibleAncestors]);
    }

    if (isPureRoute) {
      const nearestVisible = parentVisibleAncestors[parentVisibleAncestors.length - 1];
      if (nearestVisible && node.path?.trim()) {
        routeToMenuPathMap.set(node.path.trim(), nearestVisible);
      }
    }

    const nextVisibleAncestors =
      isPureRoute || node.hidden ? parentVisibleAncestors : [...parentVisibleAncestors, menuKey];

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
