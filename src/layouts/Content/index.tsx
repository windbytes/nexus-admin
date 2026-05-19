import { Layout } from 'antd';
import { memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router';
import { useShallow } from 'zustand/shallow';
import KeepAlive from '@/components/KeepAlive';
import { usePreferencesStore } from '@/stores/store';
import { ErrorFallback } from './ErrorBoundary';

/**
 * 中间主内容区域
 *
 * tabbar 开启时，使用 KeepAlive（内部通过 useOutlet() 获取路由元素进行缓存）；
 * tabbar 关闭时，直接渲染 <Outlet />。
 */
const Content = memo(() => {
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
        {tabbarEnable ? <KeepAlive /> : <Outlet />}
      </ErrorBoundary>
    </Layout.Content>
  );
});

Content.displayName = 'Content';

export default Content;
