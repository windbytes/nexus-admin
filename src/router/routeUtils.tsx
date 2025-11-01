import type { RouteItem } from '@/types/route';
import { lazy } from 'react';

/**
 * 动态导入组件
 * @param componentPath 组件路径（相对于 views 目录）
 * @returns 懒加载的组件
 */
export function lazyLoadComponent(moduleName: string) {
  const viteModule = import.meta.glob('../**/*.tsx');
  //组件地址
  let URL = '';
  if (moduleName === 'layouts') {
    URL = `../layouts/index.tsx`;
  } else if (moduleName.endsWith('.tsx')) {
    URL = `../views/${moduleName}`;
  } else {
    URL = `../views/${moduleName}/index.tsx`;
  }
  const Module = lazy((viteModule[`${URL}`] as any) ?? (() => import('@/views/error/404')));
  return <Module />;
}

/**
 * 将菜单路径转换为 TanStack Router 可识别的路径
 * @param path 原始路径
 * @returns 转换后的路径
 */
export function normalizeRoutePath(path: string): string {
  // 确保路径以 / 开头
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // 移除末尾的 /
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path;
}

/**
 * 判断路由是否有效
 * @param item 路由项
 * @returns 是否有效
 */
export function isValidRoute(item: RouteItem): boolean {
  return !!(typeof item === 'object' && item.path && item.component && item.route !== false && !item.hidden);
}

/**
 * 扁平化路由树
 * 将嵌套的路由结构转换为扁平的路由列表
 * @param routes 路由列表
 * @returns 扁平化的路由列表
 */
export function flattenRoutes(
  routes: RouteItem[]
): Array<{ path: string; component: any; menuKey: string; meta?: any }> {
  const result: Array<{ path: string; component: any; menuKey: string; meta?: any }> = [];

  for (const route of routes) {
    if (isValidRoute(route)) {
      // TanStack Router 的子路由路径应该是相对路径（不带父路径前缀）
      const normalizedPath = normalizeRoutePath(route.path);

      result.push({
        path: normalizedPath,
        component: lazyLoadComponent(route.component).type,
        menuKey: route.id,
        meta: route.meta,
      });
    }

    // 递归处理子路由
    if (route.children && route.children.length > 0) {
      result.push(...flattenRoutes(route.children));
    }

    // 递归处理子路由（childrenRoute）
    if (route.childrenRoute && route.childrenRoute.length > 0) {
      result.push(...flattenRoutes(route.childrenRoute));
    }
  }

  return result;
}

/**
 * 生成动态路由配置
 * @param menus 菜单列表
 * @returns 扁平化的路由配置
 */
export function generateDynamicRoutes(menus: RouteItem[]) {
  return flattenRoutes(menus);
}
