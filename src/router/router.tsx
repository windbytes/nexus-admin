import { ErrorFallback } from '@/layouts/Content/ErrorBoundary';
import { useMenuStore } from '@/stores/store';
import { Icon } from '@iconify/react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { Spin } from 'antd';
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
    }

    // 创建路由树（即使没有动态路由，也要创建基础路由）
    const routeTree = createRouteTree(dynamicRoutes);

    // 创建路由实例
    const router = createRouter({
      routeTree,
      defaultPreload: 'intent', // 预加载策略
      defaultPreloadDelay: 100, // 预加载延迟
      // 添加默认的错误处理
      defaultErrorComponent: ({ error, reset }) => <ErrorFallback error={error} resetBoundary={reset} />,
    });

    setRouterInstance(router);
  }, [menus]);

  // 如果路由还未初始化，显示加载状态
  if (!routerInstance) {
    return (
      <div className='h-full flex items-center justify-center min-h-[400px]'
      >
        <Spin indicator={<Icon icon="eos-icons:bubble-loading" width={48} />} size="large" fullscreen />
      </div>
    );
  }

  return <RouterProvider router={routerInstance} />;
}
