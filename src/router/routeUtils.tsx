import type { RouteItem } from '@/types/route';

/**
 * 动态导入组件（用于 React Router v7）
 * @param moduleName 组件路径（相对于 views 目录）
 * @returns 返回一个异步函数，用于 React Router v7 的 lazy 加载
 */
export function lazyLoadComponent(moduleName: string): () => Promise<{ default: React.ComponentType<any> }> {
  const viteModule = import.meta.glob('../**/*.tsx');

  // 组件地址
  let URL = '';
  if (moduleName === 'layouts') {
    URL = `../layouts/index.tsx`;
  } else if (moduleName.endsWith('.tsx')) {
    URL = `../views/${moduleName}`;
  } else {
    URL = `../views/${moduleName}/index.tsx`;
  }

  // 检查组件是否存在
  if (!viteModule[URL]) {
    console.error(`❌ 组件未找到: ${URL}`);
    return () => import('@/views/error/404');
  }

  // 返回一个异步导入函数，用于 React Router v7 的 lazy 加载
  return viteModule[URL] as () => Promise<{ default: React.ComponentType<any> }>;
}

/**
 * 将菜单路径转换为路由路径
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
): Array<{ path: string; component: () => Promise<{ default: React.ComponentType<any> }>; menuKey: string; meta?: any }> {
  const result: Array<{ path: string; component: () => Promise<{ default: React.ComponentType<any> }>; menuKey: string; meta?: any }> = [];

  for (const route of routes) {
    if (isValidRoute(route)) {
      // 规范化路径
      const normalizedPath = normalizeRoutePath(route.path);

      // 加载组件（返回的是异步导入函数）
      const component = lazyLoadComponent(route.component);

      result.push({
        path: normalizedPath,
        component: component,
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
