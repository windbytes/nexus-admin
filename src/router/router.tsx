import { useMenuStore } from '@/stores/store';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { authenticatedRoute, baseRoutes, rootRoute } from './routes';
import { routeTreeManager } from './routeTree';

/**
 * 创建路由树
 * 组合静态路由和动态路由
 */
function createRouteTree(dynamicRoutes: any[] = []) {
  // 将动态路由添加到认证路由下
  const authenticatedWithChildren = authenticatedRoute.addChildren(dynamicRoutes);

  // 创建完整的路由树
  const routeTree = rootRoute.addChildren([authenticatedWithChildren, ...baseRoutes]);

  return routeTree;
}

/**
 * 路由组件
 * 根据菜单数据动态生成路由
 */
export function Router() {
  const { menus } = useMenuStore();
  const [routerInstance, setRouterInstance] = useState<any>(null);

  // 当菜单变化时，重新生成路由
  useEffect(() => {
    // 生成动态路由（如果有菜单数据）
    let dynamicRoutes: any[] = [];

    if (menus && menus.length > 0) {
      dynamicRoutes = routeTreeManager.generateRoutes(menus);

      console.log('📋 生成的动态路由数量:', dynamicRoutes.length);
      console.log(
        '🔗 动态路由路径:',
        dynamicRoutes.map((r: any) => r.path || r.id)
      );
    } else {
      console.log('⚠️ 没有菜单数据，只加载基础路由（登录、错误页等）');
    }

    // 创建路由树（即使没有动态路由，也要创建基础路由）
    const routeTree = createRouteTree(dynamicRoutes);

    // 创建路由实例
    const router = createRouter({
      routeTree,
      defaultPreload: 'intent', // 预加载策略
      defaultPreloadDelay: 100, // 预加载延迟
      // 添加默认的错误处理
      defaultErrorComponent: ({ error }) => (
        <div style={{ padding: '20px' }}>
          <h2>发生错误</h2>
          <pre>{error.message}</pre>
        </div>
      ),
      // 404 处理
      defaultNotFoundComponent: () => {
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>404 - 页面未找到</h2>
            <p>请检查路由配置和菜单数据</p>
          </div>
        );
      },
    });

    setRouterInstance(router);
  }, [menus]);

  // 如果路由还未初始化，显示加载状态
  if (!routerInstance) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        正在初始化路由...
      </div>
    );
  }

  return <RouterProvider router={routerInstance} />;
}
