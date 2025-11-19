import { useMenuStore } from '@/stores/store';
import { Icon } from '@iconify/react';
import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import type { RouteObject } from 'react-router';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { createBaseRoutes } from './routes';
import { routeTreeManager } from './routeTree';

/**
 * 路由组件
 * 根据菜单数据动态生成路由
 */
export function Router() {
  const { menus } = useMenuStore();
  const [routerInstance, setRouterInstance] = useState<ReturnType<typeof createBrowserRouter> | null>(null);

  // 当菜单变化时，重新生成路由
  useEffect(() => {
    // 生成动态路由（如果有菜单数据）
    let dynamicRoutes: RouteObject[] = [];

    if (menus && menus.length > 0) {
      dynamicRoutes = routeTreeManager.generateRoutes(menus);
    }

    // 创建完整的路由配置（包含基础路由和动态路由）
    const routes = createBaseRoutes(dynamicRoutes);

    // 创建路由实例
    const router = createBrowserRouter(routes, {
      future: {
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_relativeSplatPath: true,
        v7_skipActionErrorRevalidation: true,
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
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '400px',
        }}
      >
        <Spin indicator={<Icon icon="eos-icons:bubble-loading" width={48} />} fullscreen />
      </div>
    );
  }

  return <RouterProvider router={routerInstance} />;
}
