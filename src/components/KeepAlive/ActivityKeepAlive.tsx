import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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
  const prevActiveKeyRef = useRef<string>('');

  // 保存滚动位置（不依赖外部状态）
  const saveScrollPosition = useCallback((key: string) => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const scrollLeft = containerRef.current.scrollLeft;

      const cached = cacheRef.current.get(key);
      if (cached) {
        cached.scrollTop = scrollTop;
        cached.scrollLeft = scrollLeft;
      }
    }
  }, []);

  // 恢复滚动位置（不依赖外部状态）
  const restoreScrollPosition = useCallback((key: string) => {
    const cached = cacheRef.current.get(key);
    if (cached && containerRef.current) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再设置滚动位置
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = cached.scrollTop;
          containerRef.current.scrollLeft = cached.scrollLeft;
        }
      });
    }
  }, []);

  // 清除指定key的缓存
  const clearCache = useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  // 清除所有缓存
  const clearAllCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // 【优化】使用 useMemo 缓存 keepAlive 标记，减少重复计算
  const shouldCache = useMemo(() => {
    const currentTab = tabs.find((tab) => tab.key === activeKey);
    return currentTab?.route?.meta?.keepAlive === true;
  }, [tabs, activeKey]);

  // 【优化】合并主要逻辑到单个 useEffect
  useEffect(() => {
    if (!activeKey) return;

    // 1. 保存之前页面的滚动位置
    const previousActiveKey = prevActiveKeyRef.current;
    if (previousActiveKey && previousActiveKey !== activeKey) {
      saveScrollPosition(previousActiveKey);
    }
    prevActiveKeyRef.current = activeKey;

    // 2. 处理当前页面的缓存和渲染
    if (shouldCache) {
      // 需要缓存的页面
      let cached = cacheRef.current.get(activeKey);

      if (!cached) {
        // 创建新缓存
        cached = {
          component: children as React.ReactElement,
          scrollTop: 0,
          scrollLeft: 0,
        };
        cacheRef.current.set(activeKey, cached);
      }

      setCurrentComponent(cached.component);
      restoreScrollPosition(activeKey);
    } else {
      // 不需要缓存的页面，直接渲染
      setCurrentComponent(children as React.ReactElement);
      
      // 清除可能存在的旧缓存
      if (cacheRef.current.has(activeKey)) {
        clearCache(activeKey);
      }
    }

    // 3. 【优化】智能清理缓存 - 只在缓存数量过多时执行
    const maxCacheSize = 10;
    if (cacheRef.current.size > maxCacheSize) {
      const cacheEntries = Array.from(cacheRef.current.entries());
      const keepAliveTabs = tabs.filter((tab) => tab.route?.meta?.keepAlive === true);
      const keepAliveKeys = keepAliveTabs.map((tab) => tab.key);

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
  }, [activeKey, children, shouldCache, saveScrollPosition, restoreScrollPosition, clearCache, tabs]);

  // 【优化】清理不存在的 tab 对应的缓存 - 使用 useMemo 优化
  const tabKeys = useMemo(() => tabs.map((tab) => tab.key), [tabs]);
  
  useEffect(() => {
    const cacheKeys = Array.from(cacheRef.current.keys());
    cacheKeys.forEach((key) => {
      if (!tabKeys.includes(key)) {
        clearCache(key);
      }
    });
  }, [tabKeys, clearCache]);

  // 【优化】监听页面刷新/关闭和退出登录 - 合并到一个 useEffect
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearAllCache();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user-storage') {
        try {
          const userData = JSON.parse(e.newValue || '{}');
          if (!userData.isLogin) {
            clearAllCache();
          }
        } catch (error) {
          // 解析失败，忽略
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [clearAllCache]);

  // 暴露清除缓存的方法给外部使用
  useEffect(() => {
    (window as any).__keepAliveClearCache = clearCache;
    (window as any).__keepAliveClearAllCache = clearAllCache;

    return () => {
      delete (window as any).__keepAliveClearCache;
      delete (window as any).__keepAliveClearAllCache;
    };
  }, [clearCache, clearAllCache]);

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

export default React.memo(ActivityKeepAlive);
