import RouteLoadingBar from '@/components/RouteLoadingBar';
import { usePreferencesStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import { createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { Layout, Skeleton } from 'antd';
import { lazy, Suspense } from 'react';

// 懒加载组件
const LoginComponent = lazy(() => import('@/views/Login'));
const Login2Component = lazy(() => import('@/views/Login2'));
const NotFoundComponent = lazy(() => import('@/views/error/404'));
const ForbiddenComponent = lazy(() => import('@/views/error/403'));
const ServerErrorComponent = lazy(() => import('@/views/error/500'));

// 懒加载布局组件
const Header = lazy(() => import('@/layouts/Header'));
const LeftMenu = lazy(() => import('@/layouts/LeftMenu'));
const Content = lazy(() => import('@/layouts/Content/index'));
const Footer = lazy(() => import('@/layouts/Footer'));
const ScreenLock = lazy(() => import('@/components/ScreenLock'));

/**
 * 根路由
 */
export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

/**
 * 认证布局路由
 * 需要登录才能访问的页面都在此布局下
 */
export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  // id: '_authenticated',
  path: '/',
  component: () => {
    const lockScreenStatus = usePreferencesStore((state) => state.preferences.widget.lockScreenStatus);

    return (
      <>
        <RouteLoadingBar />
        <Layout className="h-full">
          <Suspense fallback={<Skeleton active />}>
            <LeftMenu />
          </Suspense>

          <Layout>
            <Suspense fallback={<Skeleton active />}>
              <Header />
            </Suspense>

            <Suspense fallback={<Skeleton active />}>
              <Content>
                <Outlet />
              </Content>
            </Suspense>

            <Suspense fallback={<Skeleton active />}>
              <Footer />
            </Suspense>
          </Layout>
        </Layout>

        {lockScreenStatus && (
          <Suspense fallback={null}>
            <ScreenLock />
          </Suspense>
        )}
      </>
    );
  },
  beforeLoad: async ({ location }) => {
    const { isLogin } = useUserStore.getState();

    if (!isLogin) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

/**
 * 登录路由
 */
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginComponent,
  beforeLoad: async () => {
    const { isLogin, homePath } = useUserStore.getState();

    if (isLogin) {
      throw redirect({
        to: homePath,
      });
    }
  },
});

/**
 * 登录路由2
 */
export const login2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login2',
  component: Login2Component,
  beforeLoad: async () => {
    const { isLogin, homePath } = useUserStore.getState();

    if (isLogin) {
      throw redirect({
        to: homePath,
      });
    }
  },
});

/**
 * 根路径路由 - 重定向
 */
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    const { isLogin, homePath } = useUserStore.getState();

    throw redirect({
      to: isLogin ? homePath : '/login',
    });
  },
});

/**
 * 404 路由 - 显式访问 /404
 */
export const notFoundRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/404',
  component: NotFoundComponent,
});

/**
 * Catch-all 路由 - 捕获所有未匹配的认证路由
 * 这个路由会在布局内显示 404，而不是替换整个页面
 */
export const catchAllRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '$',
  component: NotFoundComponent,
});

/**
 * 403 路由
 */
export const forbiddenRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/403',
  component: ForbiddenComponent,
});

/**
 * 500 路由
 */
export const serverErrorRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/500',
  component: ServerErrorComponent,
});

/**
 * 基础路由配置（不包含动态路由）
 * 注意：catchAllRoute 必须最后添加，以确保它不会覆盖其他路由
 */
export const baseRoutes = [
  indexRoute,
  loginRoute,
  login2Route,
  notFoundRoute,
  forbiddenRoute,
  serverErrorRoute,
  catchAllRoute, // 必须放在最后
];
