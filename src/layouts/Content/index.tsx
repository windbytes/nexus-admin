import ActivityKeepAlive from '@/components/KeepAlive/ActivityKeepAlive';
import { useRouteChangeMonitor } from '@/hooks/useRouteChangeMonitor';
import AuthRouter from '@/router/AuthRouter';
import { ErrorFallback } from '@/router/ErrorBoundary';
import { Layout, Skeleton } from 'antd';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router';

/**
 * 中间主内容区域
 * @returns
 */
const Content: React.FC = () => {
  // 错误边界加key的目的是为了每次路由切换的时候都重新渲染错误边界，避免切换到新的路由的时候不会重新渲染
  const location = useLocation();

  // 【性能监控】监控路由切换性能
  useRouteChangeMonitor({
    enabled: true, // 可以通过环境变量控制
    threshold: 300, // 超过300ms输出警告
  });

  return (
    <Layout.Content className="overflow-x-hidden overflow-y-auto">
      <Suspense fallback={<Skeleton />}>
        <ErrorBoundary key={location.pathname} fallback={<ErrorFallback />}>
          <AuthRouter>
            <ActivityKeepAlive>
              <Outlet />
            </ActivityKeepAlive>
          </AuthRouter>
        </ErrorBoundary>
      </Suspense>
    </Layout.Content>
  );
};

export default Content;
