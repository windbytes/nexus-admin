import { useMenuStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import type { RouteItem } from '@/types/route';
import type { RouteObject } from 'react-router';
import { redirect } from 'react-router';
import { generateDynamicRoutes } from './routeUtils';

/**
 * 动态路由树管理器
 * 用于根据菜单数据动态生成和管理路由
 */
class RouteTreeManager {
  private dynamicRoutes: Map<string, RouteObject> = new Map();

  /**
   * 根据菜单生成动态路由
   * @param menus 菜单数据
   * @returns React Router v7 格式的路由数组
   */
  generateRoutes(menus: RouteItem[]): RouteObject[] {
    // 清空之前的动态路由
    this.dynamicRoutes.clear();

    // 获取扁平化的路由配置
    const flatRoutes = generateDynamicRoutes(menus);

    // 为每个路由创建 RouteObject
    const routes: RouteObject[] = flatRoutes.map((routeConfig) => {
      try {
        // 创建路由 loader，用于权限检查
        const routeLoader = async ({ request }: { request: Request }) => {
          // 路由加载前判断用户是否登录了
          const { isLogin } = useUserStore.getState();
          if (!isLogin) {
            const url = new URL(request.url);
            throw redirect(`/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
          }

          // 路由权限检查可以在这里进行
          const meta = routeConfig.meta;
          if (meta?.requiresAuth) {
            // 如果需要特殊权限，可以在这里检查
            // 例如检查用户是否有访问该页面的权限
          }

          return null;
        };

        // 构建路由路径（移除开头的 /，因为 React Router v7 的子路由使用相对路径）
        let routePath = routeConfig.path;
        if (routePath.startsWith('/')) {
          routePath = routePath.slice(1);
        }

        const route: RouteObject = {
          path: routePath || undefined,
          lazy: async () => {
            // 动态导入组件
            const module = await routeConfig.component();
            // React Router v7 的 lazy 需要返回 { Component } 格式
            return { Component: module.default };
          },
          loader: routeLoader,
          handle: {
            menuKey: routeConfig.menuKey,
            meta: routeConfig.meta,
          },
        };

        this.dynamicRoutes.set(routeConfig.path, route);
        return route;
      } catch (error) {
        console.error(`❌ 路由创建失败: ${routeConfig.path}`, error);
        // 返回一个错误路由
        return {
          path: routeConfig.path,
          lazy: async () => {
            const { default: Component } = await import('@/views/error/404');
            return { Component };
          },
        };
      }
    });

    return routes;
  }

  /**
   * 获取所有动态路由
   */
  getAllRoutes(): RouteObject[] {
    return Array.from(this.dynamicRoutes.values());
  }

  /**
   * 根据路径获取路由
   */
  getRoute(path: string): RouteObject | undefined {
    return this.dynamicRoutes.get(path);
  }

  /**
   * 清空所有动态路由
   */
  clear() {
    this.dynamicRoutes.clear();
  }
}

// 创建单例
export const routeTreeManager = new RouteTreeManager();

/**
 * 初始化路由树
 * 根据菜单数据生成路由
 */
export function initializeRouteTree() {
  const { menus } = useMenuStore.getState();
  return routeTreeManager.generateRoutes(menus);
}
