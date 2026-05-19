import { Layout, Skeleton, Watermark } from 'antd';
import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router';
import { useShallow } from 'zustand/shallow';
import Console from '@/components/Console';
import HotKeyProvider from '@/components/HotKeyProvider';
import RouteLoadingBar from '@/components/RouteLoadingBar';
import { usePreferencesStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';

const LoginComponent = lazy(() => import('@/views/Login'));
const GitHubOAuthCallbackComponent = lazy(() => import('@/views/Login/GitHubOAuthCallback'));
const NotFoundComponent = lazy(() => import('@/views/error/404'));
const ForbiddenComponent = lazy(() => import('@/views/error/403'));
const ServerErrorComponent = lazy(() => import('@/views/error/500'));

const Header = lazy(() => import('@/layouts/Header'));
const LeftMenu = lazy(() => import('@/layouts/LeftMenu'));

import Content from '@/layouts/Content/index';

const Footer = lazy(() => import('@/layouts/Footer'));
const ScreenLock = lazy(() => import('@/components/ScreenLock'));

const HORIZONTAL_LAYOUT = 'header-nav';

/**
 * 认证布局组件
 */
function AuthenticatedLayout() {
  const { watermarkEnabled, lockScreenStatus, layout } = usePreferencesStore(
    useShallow((state) => ({
      watermarkEnabled: state.preferences.app.watermark,
      lockScreenStatus: state.preferences.widget.lockScreenStatus,
      layout: state.preferences.app.layout,
    }))
  );
  const showLeftMenu = layout !== HORIZONTAL_LAYOUT;

  const layoutContent = (
    <Layout className="h-full">
      {showLeftMenu && (
        <Suspense fallback={<Skeleton active />}>
          <LeftMenu />
        </Suspense>
      )}

      <Layout>
        <Suspense fallback={<Skeleton active />}>
          <Header />
        </Suspense>

        <Content />

        <Suspense fallback={<Skeleton active />}>
          <Footer />
        </Suspense>
      </Layout>
    </Layout>
  );

  return (
    <HotKeyProvider>
      <RouteLoadingBar />
      <Watermark content={watermarkEnabled ? 'Syndra Pro' : ''} gap={[80, 80]} className="w-full h-full">
        {layoutContent}
      </Watermark>

      {lockScreenStatus && (
        <Suspense fallback={null}>
          <ScreenLock />
        </Suspense>
      )}

      <Console />
    </HotKeyProvider>
  );
}

/**
 * 认证守卫组件 - 替代 beforeLoad 的 redirect 逻辑
 */
function AuthGuard() {
  const { isLogin } = useUserStore.getState();

  if (!isLogin) {
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  return <AuthenticatedLayout />;
}

/**
 * 登录守卫组件 - 已登录用户访问登录页时重定向
 */
function LoginGuard({ children }: { children: React.ReactNode }) {
  const { isLogin, homePath } = useUserStore.getState();

  if (isLogin) {
    return <Navigate to={homePath || '/home'} replace />;
  }

  return <>{children}</>;
}

/**
 * 根路径重定向
 */
function RootRedirect() {
  const { isLogin, homePath } = useUserStore.getState();

  return <Navigate to={isLogin ? homePath || '/home' : '/login'} replace />;
}

/**
 * 创建基础路由配置（不含动态路由）
 */
export function createBaseRoutes(dynamicRoutes: RouteObject[] = []): RouteObject[] {
  return [
    {
      path: '/',
      element: <RootRedirect />,
    },
    {
      path: '/login',
      element: (
        <LoginGuard>
          <Suspense fallback={null}>
            <LoginComponent />
          </Suspense>
        </LoginGuard>
      ),
    },
    {
      path: '/login/github-callback',
      element: (
        <Suspense fallback={null}>
          <GitHubOAuthCallbackComponent />
        </Suspense>
      ),
    },
    {
      element: <AuthGuard />,
      children: [
        {
          path: '/404',
          element: (
            <Suspense fallback={null}>
              <NotFoundComponent />
            </Suspense>
          ),
        },
        {
          path: '/403',
          element: (
            <Suspense fallback={null}>
              <ForbiddenComponent />
            </Suspense>
          ),
        },
        {
          path: '/500',
          element: (
            <Suspense fallback={null}>
              <ServerErrorComponent />
            </Suspense>
          ),
        },
        ...dynamicRoutes,
        {
          path: '*',
          element: (
            <Suspense fallback={null}>
              <NotFoundComponent />
            </Suspense>
          ),
        },
      ],
    },
  ];
}
