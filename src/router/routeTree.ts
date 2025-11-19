import { useMenuStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import type { RouteItem } from '@/types/route';
import { findMenuByPath } from '@/utils/utils';
import { createRoute, redirect } from '@tanstack/react-router';
import { authenticatedRoute } from './routes';
import { generateDynamicRoutes } from './routeUtils';

/**
 * 动态路由树管理器
 * 用于根据菜单数据动态生成和管理路由
 */
class RouteTreeManager {
  private dynamicRoutes: Map<string, any> = new Map();

  /**
   * 根据菜单生成动态路由
   * @param menus 菜单数据
   */
  generateRoutes(menus: RouteItem[]) {
    // 清空之前的动态路由
    this.dynamicRoutes.clear();

    // 获取扁平化的路由配置
    const flatRoutes = generateDynamicRoutes(menus);

    // 为每个路由创建 route 对象
    flatRoutes.forEach((routeConfig) => {
      try {
        const route = createRoute({
          getParentRoute: () => authenticatedRoute,
          path: routeConfig.path,
          component: routeConfig.component,
          // 可以在这里添加 loader 来处理数据加载
          beforeLoad: async ({ location }) => {
            // 路由加载前判断用户是否登录了
            const { isLogin, loginUser } = useUserStore.getState();
            if (!isLogin) {
              throw redirect({
                to: '/login',
                search: { redirect: location.href },
              });
            }
            // 路由权限检查可以在这里进行
            const meta = routeConfig.meta;
            // 如果路由不需要权限检查，直接通过
            if (meta?.ignoreAuth || !meta?.requiresAuth) {
              return;
            }
            // 管理员直接通过
            if (loginUser === 'admin') {
              return;
            }
            // @TODO 这里后续还需要修改判定规则，需要修改表结构的设计才可行（单一的菜单、权限关联表）
            // 获取用户当前菜单的权限（从菜单缓存中查找）
            const { caches } = useMenuStore.getState();
            const currentMenu = findMenuByPath(location.pathname, caches);

            if (!currentMenu) {
              throw redirect({
                to: '/403',
                search: { from: location.href },
              });
            }

            // 检查路由配置中的权限列表
            const requiredPermissions = meta?.permissionList || [];

            // 如果没有配置权限列表，但有 requiresAuth，说明需要权限但未配置，拒绝访问
            if (requiredPermissions.length === 0) {
              throw redirect({
                to: '/403',
                search: { from: location.href },
              });
            }
          },
        });

        this.dynamicRoutes.set(routeConfig.path, route);
      } catch (error) {
        console.error(`❌ 路由创建失败: ${routeConfig.path}`, error);
      }
    });
    return Array.from(this.dynamicRoutes.values());
  }

  /**
   * 获取所有动态路由
   */
  getAllRoutes() {
    return Array.from(this.dynamicRoutes.values());
  }

  /**
   * 根据路径获取路由
   */
  getRoute(path: string) {
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
