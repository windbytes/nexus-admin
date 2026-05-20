import { lazy } from 'react';
import type { RouteItem } from '@/types/route';

/**
 * 动态导入组件
 * @param moduleName 组件路径（相对于 views 目录）
 * @returns 懒加载的组件函数
 */
export function lazyLoadComponent(moduleName: string) {
  const viteModule = import.meta.glob('../views/**/*.tsx');

  let URL = '';
  if (moduleName === 'layouts') {
    URL = '../layouts/index.tsx';
  } else if (moduleName.endsWith('.tsx')) {
    URL = `../views/${moduleName}`;
  } else {
    URL = `../views/${moduleName}/index.tsx`;
  }

  if (!viteModule[URL]) {
    return lazy(() => import('@/views/error/404'));
  }
  return lazy(viteModule[URL] as unknown as () => Promise<{ default: React.ComponentType<any> }>);
}

/**
 * 将菜单路径转换为 React Router 可识别的路径
 */
export function normalizeRoutePath(path: string): string {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path;
}

/**
 * 判断路由是否有效
 */
export function isValidRoute(item: RouteItem): boolean {
  return !!(typeof item === 'object' && item.path && item.component && item.route !== false && !item.hidden);
}

/**
 * 扁平化路由树
 * 将嵌套的路由结构转换为扁平的路由列表
 */
export function flattenRoutes(
  routes: RouteItem[]
): Array<{ path: string; component: any; menuKey: string; meta?: any }> {
  const result: Array<{ path: string; component: any; menuKey: string; meta?: any }> = [];

  for (const route of routes) {
    if (isValidRoute(route)) {
      const normalizedPath = normalizeRoutePath(route.path);
      const component = lazyLoadComponent(route.component);

      result.push({
        path: normalizedPath,
        component: component,
        menuKey: route.id,
        meta: route.meta,
      });
    }

    if (route.children && route.children.length > 0) {
      result.push(...flattenRoutes(route.children));
    }

    if (route.childrenRoute && route.childrenRoute.length > 0) {
      result.push(...flattenRoutes(route.childrenRoute));
    }
  }

  return result;
}

/**
 * 生成动态路由配置
 */
export function generateDynamicRoutes(menus: RouteItem[]) {
  return flattenRoutes(menus);
}
