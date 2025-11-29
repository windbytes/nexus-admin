import { useTabStore } from '@/stores/tabStore';
import KeepAlive, { useKeepAliveRef, type KeepAliveRef } from 'keepalive-for-react';
import React, { memo, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

interface KeepAliveProps {
  children: React.ReactNode;
}

/**
 * KeepAlive component using keepalive-for-react
 */
const KeepAliveLayout: React.FC<KeepAliveProps> = memo(({ children }) => {
  const { tabs, activeKey } = useTabStore(
    useShallow((state) => ({
      tabs: state.tabs,
      activeKey: state.activeKey,
    }))
  );

  const aliveRef = useKeepAliveRef();

  // Filter tabs that should be kept alive
  const keepAliveIncludes = useMemo(() => {
    return tabs
      .filter((tab) => tab.route?.meta?.keepAlive)
      .map((tab) => tab.key);
  }, [tabs]);

  // Handle Reload
  // Watch for reloadKey changes on the active tab
  const currentTab = tabs.find((tab) => tab.key === activeKey);
  const reloadKey = currentTab?.reloadKey;

  useEffect(() => {
    if (reloadKey && aliveRef.current) {
      aliveRef.current.refresh(activeKey);
    }
  }, [reloadKey, activeKey]);

  // Optional: Clean up cache for closed tabs explicitly if needed
  // although 'include' prop should handle it, explicit cleanup ensures memory is freed immediately
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
        viewTransition
        aliveRef={aliveRef as React.RefObject<KeepAliveRef | undefined>}
        activeCacheKey={activeKey}
        include={keepAliveIncludes}
        max={10} // Default max, can be configured
        cacheNodeClassName="h-full w-full" // Ensure cached nodes take full height/width if needed
      >
        {children}
      </KeepAlive>
  );
});

KeepAliveLayout.displayName = 'KeepAlive';

export default KeepAliveLayout;
