import { createElement, Fragment, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { Navigate } from 'react-router';
import { useMenuStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import type { RouteItem } from '@/types/route';
import { findMenuByPath } from '@/utils/utils';
import { generateDynamicRoutes } from './routeUtils';

/**
 * 路由权限守卫组件
 */
function RoutePermissionGuard({ meta, children }: { meta?: any; children?: React.ReactNode }) {
  const { isLogin, loginUser } = useUserStore.getState();

  if (!isLogin) {
    const currentPath = window.location.pathname + window.location.search;
    return createElement(Navigate, {
      to: `/login?redirect=${encodeURIComponent(currentPath)}`,
      replace: true,
    });
  }

  if (meta?.ignoreAuth || !meta?.requiresAuth) {
    return createElement(Fragment, null, children);
  }

  if (loginUser === 'admin') {
    return createElement(Fragment, null, children);
  }

  const { caches } = useMenuStore.getState();
  const currentMenu = findMenuByPath(window.location.pathname, caches);

  if (!currentMenu) {
    return createElement(Navigate, {
      to: `/403?from=${encodeURIComponent(window.location.href)}`,
      replace: true,
    });
  }

  const requiredPermissions = meta?.permissionList || [];
  if (requiredPermissions.length === 0) {
    return createElement(Navigate, {
      to: `/403?from=${encodeURIComponent(window.location.href)}`,
      replace: true,
    });
  }

  return createElement(Fragment, null, children);
}

/**
 * 动态路由树管理器
 */
class RouteTreeManager {
  private dynamicRoutes: Map<string, RouteObject> = new Map();

  generateRoutes(menus: RouteItem[]): RouteObject[] {
    this.dynamicRoutes.clear();

    const flatRoutes = generateDynamicRoutes(menus);

    for (const routeConfig of flatRoutes) {
      try {
        const Component = routeConfig.component;
        const meta = routeConfig.meta;

        const route: RouteObject = {
          path: routeConfig.path,
          element: createElement(
            Suspense,
            { fallback: null },
            createElement(RoutePermissionGuard, { meta }, createElement(Component))
          ),
        };

        this.dynamicRoutes.set(routeConfig.path, route);
      } catch (error) {
        console.error(`❌ 路由创建失败: ${routeConfig.path}`, error);
      }
    }

    return Array.from(this.dynamicRoutes.values());
  }

  getAllRoutes(): RouteObject[] {
    return Array.from(this.dynamicRoutes.values());
  }

  getRoute(path: string) {
    return this.dynamicRoutes.get(path);
  }

  clear() {
    this.dynamicRoutes.clear();
  }
}

export const routeTreeManager = new RouteTreeManager();

export function initializeRouteTree() {
  const { menus } = useMenuStore.getState();
  return routeTreeManager.generateRoutes(menus);
}
