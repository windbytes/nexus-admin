import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { createBrowserRouter, type RouteObject, RouterProvider } from 'react-router';
import { useMenuStore } from '@/stores/store';
import { createBaseRoutes } from './routes';
import { routeTreeManager } from './routeTree';

function buildRouter(menus: import('@/types/route').RouteItem[]) {
  let dynamicRoutes: RouteObject[] = [];
  if (menus && menus.length > 0) {
    dynamicRoutes = routeTreeManager.generateRoutes(menus);
  }
  return createBrowserRouter(createBaseRoutes(dynamicRoutes));
}

/**
 * 路由组件
 * 根据菜单数据动态生成路由，使用 React Router 的 createBrowserRouter + RouterProvider
 *
 * 关键设计：
 * - 使用 useRef 持有 router 实例，避免每次渲染都重建整棵路由树
 * - 仅当 menus 引用真正变化时才 dispose 旧实例并创建新实例
 * - 首次同步创建 router，避免首帧闪烁 Loading
 */
export function Router() {
  const { menus } = useMenuStore();

  const routerRef = useRef<ReturnType<typeof createBrowserRouter> | null>(null);
  const menusRef = useRef(menus);

  // 同步初始化：首次渲染时就创建 router，避免 useEffect 导致的首帧空白
  if (routerRef.current === null) {
    routerRef.current = buildRouter(menus);
    menusRef.current = menus;
  }

  // 用 state 仅作为触发重渲染的信号
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // menus 引用未变化，跳过重建
    if (menus === menusRef.current) {
      return;
    }

    menusRef.current = menus;

    const oldRouter = routerRef.current;
    routerRef.current = buildRouter(menus);
    forceUpdate((n) => n + 1);

    return () => {
      oldRouter?.dispose();
    };
  }, [menus]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      routerRef.current?.dispose();
    };
  }, []);

  if (!routerRef.current) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Spin indicator={<LoadingOutlined width={48} />} size="large" fullscreen />
      </div>
    );
  }

  return <RouterProvider router={routerRef.current} />;
}
