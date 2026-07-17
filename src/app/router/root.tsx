import { createRootRoute, Outlet } from '@tanstack/react-router';
import { NotFoundPage } from './fallback';

/** 根路由组件：仅渲染子路由出口 */
function RootComponent() {
  return <Outlet />;
}

/**
 * 根路由
 *
 * 整棵路由树的根，承载全局出口与默认 404 处理。
 */
export const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});
