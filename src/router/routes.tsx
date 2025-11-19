import RouteLoadingBar from '@/components/RouteLoadingBar';
import { usePreferencesStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import type { RouteObject } from 'react-router';
import { Outlet, redirect } from 'react-router';
import { Layout, Skeleton } from 'antd';
import { Suspense, lazy } from 'react';

// 懒加载布局组件（用于 AuthenticatedLayout）
const Header = lazy(() => import('@/layouts/Header'));
const LeftMenu = lazy(() => import('@/layouts/LeftMenu'));
const Content = lazy(() => import('@/layouts/Content/index'));
const Footer = lazy(() => import('@/layouts/Footer'));
const ScreenLock = lazy(() => import('@/components/ScreenLock'));

/**
 * 认证布局组件
 * 需要登录才能访问的页面都在此布局下
 */
function AuthenticatedLayout() {
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
}

/**
 * 认证路由的 loader - 检查登录状态
 */
export async function authenticatedLoader({ request }: { request: Request }) {
  const { isLogin } = useUserStore.getState();

  if (!isLogin) {
    const url = new URL(request.url);
    throw redirect(`/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
  }

  return null;
}

/**
 * 登录路由的 loader - 如果已登录则重定向
 */
export async function loginLoader() {
  const { isLogin, homePath } = useUserStore.getState();

  if (isLogin) {
    throw redirect(homePath || '/');
  }

  return null;
}

/**
 * 根路径路由的 loader - 根据登录状态重定向
 */
export async function indexLoader() {
  const { isLogin, homePath } = useUserStore.getState();
  throw redirect(isLogin ? (homePath || '/') : '/login');
}

/**
 * 创建基础路由配置
 * @param dynamicRoutes 动态路由数组
 * @returns 完整的路由配置
 */
export function createBaseRoutes(dynamicRoutes: RouteObject[] = []): RouteObject[] {
  return [
    {
      path: '/',
      loader: indexLoader,
    },
    {
      path: '/login',
      lazy: async () => {
        const { default: Component } = await import('@/views/Login');
        return { Component };
      },
      loader: loginLoader,
    },
    {
      path: '/login2',
      lazy: async () => {
        const { default: Component } = await import('@/views/Login2');
        return { Component };
      },
      loader: loginLoader,
    },
    {
      path: '/',
      element: <AuthenticatedLayout />,
      loader: authenticatedLoader,
      children: [
        ...dynamicRoutes,
        {
          path: '404',
          lazy: async () => {
            const { default: Component } = await import('@/views/error/404');
            return { Component };
          },
        },
        {
          path: '403',
          lazy: async () => {
            const { default: Component } = await import('@/views/error/403');
            return { Component };
          },
        },
        {
          path: '500',
          lazy: async () => {
            const { default: Component } = await import('@/views/error/500');
            return { Component };
          },
        },
        {
          path: '*',
          lazy: async () => {
            const { default: Component } = await import('@/views/error/404');
            return { Component };
          },
        },
      ],
    },
  ];
}
