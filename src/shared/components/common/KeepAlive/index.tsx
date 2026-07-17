import { LoadingOutlined } from '@ant-design/icons';
import { Outlet, useLocation } from '@tanstack/react-router';
import { Spin } from 'antd';
import { KeepAlive, type KeepAliveRef, useKeepAliveRef } from 'keepalive-for-react';
import type React from 'react';
import { Suspense, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { useTabStore } from '@/shared/stores/tab.store';

/**
 * 多页签 KeepAlive 缓存。
 *
 * 实现要点：children 使用 @tanstack/react-router 的 <Outlet />，而非 <Match matchId>。
 * 原因：<Match matchId> 会在每次渲染时从路由状态中实时查找该 match，
 * 一旦切换路由，旧 match 被销毁，被 KeepAlive 缓存而仍挂载的旧节点再次渲染时
 * 就会因找不到 match 抛出「Invariant failed」。
 *
 * keepalive-for-react@5（配合 React 19.2 的 Activity）会冻结非激活的缓存节点，
 * 使其不再随路由状态变化而重渲染，从而让每个缓存槽位保留各自激活时渲染的页面，
 * 这与 react-router 下使用 useOutlet() 的快照语义一致。
 */
const KeepAliveLayout: React.FC = () => {
  const { tabs, activeKey } = useTabStore(
    useShallow((state) => ({
      tabs: state.tabs,
      activeKey: state.activeKey,
    }))
  );
  const location = useLocation();
  const aliveRef = useKeepAliveRef();

  const keepAliveIncludes = tabs.filter((tab) => tab.route?.meta?.keepAlive).map((tab) => tab.key);

  const currentTab = tabs.find((tab) => tab.key === activeKey);
  const reloadKey = currentTab?.reloadKey;

  useEffect(() => {
    if (reloadKey && aliveRef.current) {
      aliveRef.current.refresh(activeKey);
    }
  }, [reloadKey, activeKey, aliveRef]);

  useEffect(() => {
    if (aliveRef.current) {
      const cacheNodes = aliveRef.current.getCacheNodes();
      const tabKeys = new Set(tabs.map((t) => t.key));
      cacheNodes.forEach((node) => {
        if (!tabKeys.has(node.cacheKey)) {
          aliveRef.current?.destroy(node.cacheKey);
        }
      });
    }
  }, [tabs, aliveRef]);

  return (
    <KeepAlive
      aliveRef={aliveRef as React.RefObject<KeepAliveRef | undefined>}
      activeCacheKey={location.pathname}
      include={keepAliveIncludes}
      max={10}
      cacheNodeClassName="h-full w-full"
    >
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </KeepAlive>
  );
};

export default KeepAliveLayout;
