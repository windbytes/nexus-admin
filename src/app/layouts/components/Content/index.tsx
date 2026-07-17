import { LoadingOutlined } from '@ant-design/icons';
import { Outlet } from '@tanstack/react-router';
import { Layout, Spin } from 'antd';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useShallow } from 'zustand/shallow';
import KeepAlive from '@/shared/components/common/KeepAlive';
import { usePreferencesStore } from '@/shared/stores/preferences.store';
import { ErrorFallback } from './ErrorBoundary';

/**
 * 中间主内容区域
 *
 * tabbar 开启时，使用 KeepAlive（内部通过 useOutlet() 获取路由元素进行缓存）；
 * tabbar 关闭时，直接渲染 <Outlet />。
 */
const Content = () => {
  const { tabbarEnable } = usePreferencesStore(
    useShallow((state) => ({
      tabbarEnable: state.preferences.tabbar.enable,
    }))
  );

  return (
    <Layout.Content
      className="overflow-x-hidden overflow-y-auto h-full relative flex flex-col p-2"
      style={{ overscrollBehavior: 'contain' }}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {tabbarEnable ? (
          <KeepAlive />
        ) : (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        )}
      </ErrorBoundary>
    </Layout.Content>
  );
};

export default Content;
