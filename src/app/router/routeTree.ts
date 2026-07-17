import { type AnyRoute, createRoute } from '@tanstack/react-router';
import { ensureAuthenticated, ensureGuest, resolveRootRedirect } from '@/app/guards/AuthGuard';
import BasicLayout from '@/app/layouts/BasicLayout';
import GitHubOAuthCallback from '@/modules/auth/pages/github-callback';
import LoginPage from '@/modules/auth/pages/login';
import type { RouteItem } from '@/types/route';
import { createDynamicRoutes } from './dynamic';
import { ForbiddenPage, NotFoundPage, ServerErrorPage } from './fallback';
import { rootRoute } from './root';

/** 根路径：按登录态分流到首页或登录页 */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => resolveRootRedirect(),
});

/** 登录页（独立于受保护布局） */
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search['redirect'] === 'string' ? search['redirect'] : undefined,
  }),
  beforeLoad: ({ search }) => ensureGuest(search.redirect),
});

/** GitHub OAuth 回调页：交换 code 后回到登录页 */
const githubCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login/github-callback',
  component: GitHubOAuthCallback,
});

/** 403 / 500 / 404 错误页（独立路由，避免与登录态产生重定向死循环） */
const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/403',
  component: ForbiddenPage,
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search['from'] === 'string' ? search['from'] : undefined,
  }),
});
const serverErrorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/500',
  component: ServerErrorPage,
});
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/404',
  component: NotFoundPage,
});

/**
 * 受保护布局路由（pathless layout route）
 *
 * 校验登录态后渲染 BasicLayout（侧边栏 + Header + 多页签内容区 + Footer），
 * 所有业务动态路由作为它的子路由，渲染进 Content 的 Outlet。
 */
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: BasicLayout,
  beforeLoad: ({ location }) => ensureAuthenticated(location.pathname),
});

/**
 * 根据菜单数据构建完整路由树。
 *
 * 静态路由（首页重定向 / 登录 / 错误页 / 受保护布局）固定，
 * 业务动态路由由后端菜单生成并挂载到受保护布局之下。
 */
export function buildRouteTree(menus: RouteItem[]): AnyRoute {
  const dynamicRoutes = createDynamicRoutes(authLayoutRoute, menus);

  return rootRoute.addChildren([
    indexRoute,
    loginRoute,
    githubCallbackRoute,
    forbiddenRoute,
    serverErrorRoute,
    notFoundRoute,
    authLayoutRoute.addChildren(dynamicRoutes as never) as never,
  ]) as AnyRoute;
}
