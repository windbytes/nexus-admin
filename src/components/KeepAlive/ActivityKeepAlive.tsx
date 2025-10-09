import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Activity } from 'react';
import { useTabStore } from '@/stores/tabStore';

interface ActivityKeepAliveProps {
  children: React.ReactNode;
}

interface CacheItem {
  component: React.ReactElement;
  scrollTop: number;
  scrollLeft: number;
}

const ActivityKeepAlive: React.FC<ActivityKeepAliveProps> = ({ children }) => {
  const { tabs, activeKey } = useTabStore();
  const cacheRef = useRef<Map<string, CacheItem>>(new Map());
  const [currentComponent, setCurrentComponent] = useState<React.ReactElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 保存当前页面的滚动位置
  const saveScrollPosition = (key: string) => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const scrollLeft = containerRef.current.scrollLeft;

      const cached = cacheRef.current.get(key);
      if (cached) {
        cached.scrollTop = scrollTop;
        cached.scrollLeft = scrollLeft;
      }
    }
  };

  // 恢复页面的滚动位置
  const restoreScrollPosition = (key: string) => {
    const cached = cacheRef.current.get(key);
    if (cached && containerRef.current) {
      // 使用setTimeout确保DOM更新后再设置滚动位置
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = cached.scrollTop;
          containerRef.current.scrollLeft = cached.scrollLeft;
        }
      }, 0);
    }
  };

  // 清除指定key的缓存
  const clearCache = useCallback((key: string) => {
    if (cacheRef.current.has(key)) {
      cacheRef.current.delete(key);
    }
  }, []);

  // 清除所有缓存
  const clearAllCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // 智能清理缓存 - 当缓存数量过多时，清理最久未使用的缓存
  const smartClearCache = useCallback(() => {
    const maxCacheSize = 10; // 最大缓存数量
    if (cacheRef.current.size > maxCacheSize) {
      const cacheEntries = Array.from(cacheRef.current.entries());

      // 只保留配置了keepalive的页面
      const keepAliveTabs = tabs.filter((tab) => tab.route?.meta?.keepAlive === true);
      const keepAliveKeys = keepAliveTabs.map((tab) => tab.key);

      // 过滤出需要保留的缓存（当前活跃页面和最近使用的keepalive页面）
      const keysToKeep = [
        activeKey,
        ...cacheEntries
          .filter(([key]) => keepAliveKeys.includes(key))
          .slice(-5)
          .map(([key]) => key),
      ];

      const keysToRemove = cacheEntries
        .map(([key]) => key)
        .filter((key) => !keysToKeep.includes(key))
        .slice(0, cacheRef.current.size - maxCacheSize);

      for (const key of keysToRemove) {
        clearCache(key);
      }
    }
  }, [activeKey, clearCache, tabs]);

  useEffect(() => {
    if (!activeKey) return;

    // 保存之前页面的滚动位置
    const previousActiveKey = Object.keys(cacheRef.current).find((key) => key !== activeKey);
    if (previousActiveKey) {
      saveScrollPosition(previousActiveKey);
    }

    // 获取当前激活的tab信息
    const currentTab = tabs.find((tab) => tab.key === activeKey);
    const shouldCache = currentTab?.route?.meta?.keepAlive === true;

    if (shouldCache) {
      // 如果配置了keepalive，检查缓存中是否已有当前页面
      let cached = cacheRef.current.get(activeKey);

      if (!cached) {
        // 如果没有缓存，创建新的缓存项
        cached = {
          component: children as React.ReactElement,
          scrollTop: 0,
          scrollLeft: 0,
        };
        cacheRef.current.set(activeKey, cached);
      }

      // 设置当前显示的组件
      setCurrentComponent(cached.component);

      // 恢复滚动位置
      restoreScrollPosition(activeKey);
    } else {
      // 如果没有配置keepalive，直接渲染组件，不进行缓存
      setCurrentComponent(children as React.ReactElement);

      // 如果之前有缓存，清除它
      if (cacheRef.current.has(activeKey)) {
        clearCache(activeKey);
      }
    }

    // 智能清理缓存
    smartClearCache();
  }, [activeKey, children, tabs, clearCache, smartClearCache]);

  // 监听系统刷新事件
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearAllCache();
    };

    // 监听页面刷新/关闭
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [clearAllCache]);

  // 监听用户退出登录事件
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 监听 localStorage 变化，检测用户登录状态变化
      if (e.key === 'user-storage') {
        try {
          const userData = JSON.parse(e.newValue || '{}');
          if (!userData.isLogin) {
            // 用户退出登录，清空所有缓存
            clearAllCache();
          }
        } catch (error) {
          // 解析失败，忽略
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [clearAllCache]);

  // 清理不存在的tab对应的缓存
  useEffect(() => {
    const tabKeys = tabs.map((tab) => tab.key);
    const cacheKeys = Array.from(cacheRef.current.keys());

    cacheKeys.forEach((key) => {
      if (!tabKeys.includes(key)) {
        // 当tab被关闭时，清除对应的缓存
        clearCache(key);
      }
    });
  }, [tabs, clearCache]);

  // 暴露清除缓存的方法给外部使用
  useEffect(() => {
    // 将清除缓存的方法挂载到 window 对象上，方便调试和外部调用
    (window as any).__keepAliveClearCache = clearCache;
    (window as any).__keepAliveClearAllCache = clearAllCache;
    (window as any).__keepAliveSmartClearCache = smartClearCache;

    return () => {
      delete (window as any).__keepAliveClearCache;
      delete (window as any).__keepAliveClearAllCache;
      delete (window as any).__keepAliveSmartClearCache;
    };
  }, [clearCache, clearAllCache, smartClearCache]);

  if (!currentComponent) {
    return null;
  }

  // 使用React 19.2的Activity组件来实现keepalive功能
  return (
    <div ref={containerRef} className="h-full relative flex flex-col p-4">
      <Activity mode={activeKey ? 'visible' : 'hidden'}>
        {currentComponent}
      </Activity>
    </div>
  );
};

export default ActivityKeepAlive;
