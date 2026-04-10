import { LoadingOutlined } from '@ant-design/icons';
import { Layout, Spin } from 'antd';
import { memo, type ReactNode, Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useShallow } from 'zustand/shallow';
import KeepAlive from '@/components/KeepAlive';
import { usePreferencesStore } from '@/stores/store';
import { ErrorFallback } from './ErrorBoundary';

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
  const tabbarEnabled = usePreferencesStore(
    useShallow((state) => ({
      tabbarEnable: state.preferences.tabbar.enable,
    }))
  );

  const loadingFallback = useMemo(
    () => (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Spin indicator={<LoadingOutlined width={48} />} size="large" />
      </div>
    ),
    []
  );

  return (
    <Layout.Content
      className="overflow-x-hidden overflow-y-auto h-full relative flex flex-col p-2"
      style={{ overscrollBehavior: 'contain' }}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={loadingFallback}>{tabbarEnabled ? <KeepAlive>{children}</KeepAlive> : children}</Suspense>
      </ErrorBoundary>
    </Layout.Content>
  );
});

Content.displayName = 'Content';

export default Content;
