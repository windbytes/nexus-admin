import { useMenuStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import type { RouteItem } from '@/types/route';
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

    console.log('📋 菜单数据:', menus);
    console.log('🔧 扁平化后的路由配置:', flatRoutes);

    // 为每个路由创建 route 对象
    flatRoutes.forEach((routeConfig, index) => {
      try {
        const route = createRoute({
          getParentRoute: () => authenticatedRoute,
          path: routeConfig.path,
          component: routeConfig.component,
          // 可以在这里添加 loader 来处理数据加载
          beforeLoad: async ({ location }) => {
            // 路由加载前判断用户是否登录了
            const { isLogin } = useUserStore.getState();
            if (!isLogin) {
              throw redirect({
                to: '/login',
                search: { redirect: location.href },
              });
            }
            // 路由权限检查可以在这里进行
            const meta = routeConfig.meta;
            if (meta?.requiresAuth) {
              // 如果需要特殊权限，可以在这里检查
              // 例如检查用户是否有访问该页面的权限
            }
          },
        });

        this.dynamicRoutes.set(routeConfig.path, route);
        console.log(`✅ 路由 ${index + 1}/${flatRoutes.length} 创建成功: ${routeConfig.path}`);
      } catch (error) {
        console.error(`❌ 路由创建失败: ${routeConfig.path}`, error);
      }
    });

    console.log('✨ 总共生成了', this.dynamicRoutes.size, '个动态路由');
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
