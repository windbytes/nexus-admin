import ActivityKeepAlive from '@/components/KeepAlive/ActivityKeepAlive';
import { useRouteChangeMonitor } from '@/hooks/useRouteChangeMonitor';
import AuthRouter from '@/router/AuthRouter';
import { ErrorFallback } from '@/router/ErrorBoundary';
import { Layout, Skeleton } from 'antd';
import { memo, Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router';

/**
 * 中间主内容区域
 * 性能优化：
 * 1. 使用 memo 避免不必要的重渲染
 * 2. ErrorBoundary 使用 pathname 作为 key，确保路由切换时重置错误状态
 * 3. 使用 useMemo 缓存 ErrorFallback
 */
const Content = memo(() => {
  // 错误边界加key的目的是为了每次路由切换的时候都重新渲染错误边界，避免切换到新的路由的时候不会重新渲染
  const location = useLocation();

  // 【性能监控】监控路由切换性能
  useRouteChangeMonitor({
    enabled: import.meta.env.MODE === 'development', // 只在开发环境启用
    threshold: 300, // 超过300ms输出警告
  });

  // 缓存 ErrorFallback 组件
  const errorFallback = useMemo(() => <ErrorFallback />, []);

  // 缓存 Skeleton 组件
  const loadingFallback = useMemo(() => <Skeleton active />, []);

  return (
    <Layout.Content className="overflow-x-hidden overflow-y-auto">
      <Suspense fallback={loadingFallback}>
        <ErrorBoundary key={location.pathname} fallback={errorFallback}>
          <AuthRouter>
            <ActivityKeepAlive>
              <Outlet />
            </ActivityKeepAlive>
          </AuthRouter>
        </ErrorBoundary>
      </Suspense>
    </Layout.Content>
  );
});

Content.displayName = 'Content';

export default Content;
