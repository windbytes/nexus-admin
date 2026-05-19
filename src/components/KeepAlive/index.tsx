import { KeepAlive, type KeepAliveRef, useKeepAliveRef } from 'keepalive-for-react';
import type React from 'react';
import { memo, useEffect, useMemo } from 'react';
import { useLocation, useOutlet } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { useTabStore } from '@/stores/tabStore';

/**
 * 核心设计：使用 useOutlet() 代替 props.children (<Outlet />)。
 *
 * <Outlet /> 是一个动态组件，每次渲染都从 React Router 上下文读取当前匹配的路由。
 * 如果把 <Outlet /> 作为 KeepAlive 的 children，所有缓存的 portal 内的 <Outlet />
 * 都会渲染同一个「当前路由」的组件，导致：
 *   1. 被缓存的旧页面实际并没有保留，而是变成了当前页面的副本
 *   2. 多个缓存节点同时挂载同一个组件 → useEffect 多次触发 → 请求重复
 *
 * useOutlet() 返回的是当前匹配路由的 **React Element**（已解析的 JSX 树），
 * 它是一个具体的元素引用而非动态查询。被 KeepAlive 缓存后，旧条目保留的是
 * 旧路由的实际元素，新条目使用新路由的元素，互不干扰。
 */
const KeepAliveLayout: React.FC = memo(() => {
  const { tabs, activeKey } = useTabStore(
    useShallow((state) => ({
      tabs: state.tabs,
      activeKey: state.activeKey,
    }))
  );
  const location = useLocation();
  const outlet = useOutlet();
  const aliveRef = useKeepAliveRef();

  const keepAliveIncludes = useMemo(() => {
    return tabs.filter((tab) => tab.route?.meta?.keepAlive).map((tab) => tab.key);
  }, [tabs]);

  const currentTab = tabs.find((tab) => tab.key === activeKey);
  const reloadKey = currentTab?.reloadKey;

  useEffect(() => {
    if (reloadKey && aliveRef.current) {
      aliveRef.current.refresh(activeKey);
    }
  }, [reloadKey, activeKey]);

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
  }, [tabs]);

  return (
    <KeepAlive
      aliveRef={aliveRef as React.RefObject<KeepAliveRef | undefined>}
      activeCacheKey={location.pathname}
      include={keepAliveIncludes}
      max={10}
      cacheNodeClassName="h-full w-full"
    >
      {outlet}
    </KeepAlive>
  );
});

KeepAliveLayout.displayName = 'KeepAlive';

export default KeepAliveLayout;
