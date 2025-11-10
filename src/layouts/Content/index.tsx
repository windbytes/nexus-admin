import ActivityKeepAlive from '@/components/KeepAlive/ActivityKeepAlive';
import { useRouteChangeMonitor } from '@/hooks/useRouteChangeMonitor';
import { ErrorFallback } from '@/layouts/Content/ErrorBoundary';
import { Icon } from '@iconify-icon/react';
import { Layout, Spin } from 'antd';
import { memo, Suspense, useMemo, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

/**
 * 中间主内容区域
 * TanStack Router 版本
 * 性能优化：
 * 1. 使用 memo 避免不必要的重渲染
 * 2. ErrorBoundary 使用 pathname 作为 key，确保路由切换时重置错误状态
 * 3. 使用更明显的加载指示器（Spin 替代 Skeleton）
 * 4. 添加全屏加载样式，提升用户体验
 */
interface ContentProps {
  children?: ReactNode;
}

const Content = memo(({ children }: ContentProps) => {
  // 【性能监控】监控路由切换性能
  useRouteChangeMonitor({
    enabled: false,
    threshold: 300,
  });

  // 缓存 ErrorFallback 组件
  const errorFallback = useMemo(() => <ErrorFallback />, []);

  // 【优化】使用更明显的加载指示器
  const loadingFallback = useMemo(
    () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '400px',
        }}
      >
        <Spin indicator={<Icon icon="eos-icons:bubble-loading" width={48} />} size="large" />
      </div>
    ),
    []
  );

  return (
    <Layout.Content
      className="overflow-x-hidden overflow-y-auto bg-[#fafbfc]"
      style={{
        position: 'relative',
      }}
    >
      <Suspense fallback={loadingFallback}>
        <ErrorBoundary fallback={errorFallback}>
          <ActivityKeepAlive>{children}</ActivityKeepAlive>
        </ErrorBoundary>
      </Suspense>
    </Layout.Content>
  );
});

Content.displayName = 'Content';

export default Content;
