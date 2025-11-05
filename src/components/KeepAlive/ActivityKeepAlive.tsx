import { useTabStore } from '@/stores/tabStore';
import LRUCache from '@/utils/LRUCache';
import React, { Activity, memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

interface ActivityKeepAliveProps {
  children: React.ReactNode;
}

interface CacheItem {
  component: React.ReactElement;
  scrollTop: number;
  scrollLeft: number;
}

/**
 * 使用 React 19.2 Activity 组件实现的 KeepAlive 组件
 *
 * 核心优化：
 * 1. 简化 children 变化检测逻辑 - 移除冗余的 ref 追踪
 * 2. 正确使用 Activity 组件 - 为每个缓存页面创建独立的 Activity 实例
 * 3. 优化滚动恢复 - 使用更简洁的方式
 * 4. 使用 useMemo 缓存组件列表，减少渲染
 * 5. 移除不必要的状态，直接渲染缓存的组件
 * 6. 支持 reloadKey 强制重新加载组件 - 2025-11-05 该功能目前实现有点困难，153行的组件如果添加了key来重载，会导致切换前的旧路由也会触发渲染，导致组件重复渲染，目前先移除该功能
 *
 * @param children - 子组件
 */

const ActivityKeepAlive: React.FC<ActivityKeepAliveProps> = memo(({ children }) => {
  const { tabs, activeKey } = useTabStore();
  const cacheRef = useRef(new LRUCache<string, CacheItem>(10));
  const containerRef = useRef<HTMLDivElement>(null);
  const prevActiveKeyRef = useRef<string>('');

  // 获取当前页面的 keepAlive 配置
  const shouldCache = tabs.find((tab) => tab.key === activeKey)?.route?.meta?.keepAlive === true;

  // 主逻辑：缓存管理和滚动位置保存
  useEffect(() => {
    if (!activeKey) return;

    // 1. 保存之前页面的滚动位置
    const previousActiveKey = prevActiveKeyRef.current;
    if (previousActiveKey && previousActiveKey !== activeKey && containerRef.current) {
      const cached = cacheRef.current.get(previousActiveKey);
      if (cached) {
        cached.scrollTop = containerRef.current.scrollTop;
        cached.scrollLeft = containerRef.current.scrollLeft;
      }
    }
    prevActiveKeyRef.current = activeKey;

    // 2. 处理当前页面的缓存
    if (shouldCache) {
      const cached = cacheRef.current.get(activeKey);

      // 如果缓存不存在或 children 变化了，更新缓存
      if (!cached || cached.component !== children) {
        cacheRef.current.set(activeKey, {
          component: children as React.ReactElement,
          scrollTop: cached?.scrollTop || 0,
          scrollLeft: cached?.scrollLeft || 0,
        });
      }
    } else {
      // 不需要缓存的页面，删除可能存在的旧缓存
      cacheRef.current.delete(activeKey);
    }

    // 3. 清理不存在的 tab 对应的缓存
    const tabKeys = new Set(tabs.map((tab) => tab.key));
    cacheRef.current.forEach((_, key) => {
      if (!tabKeys.has(key)) {
        cacheRef.current.delete(key);
      }
    });
  }, [activeKey, shouldCache, tabs, children]);

  // 恢复滚动位置 - 使用 useLayoutEffect 防止闪烁
  useLayoutEffect(() => {
    if (!activeKey || !containerRef.current) return;

    const cached = cacheRef.current.get(activeKey);
    if (cached) {
      containerRef.current.scrollTop = cached.scrollTop;
      containerRef.current.scrollLeft = cached.scrollLeft;
    }
  }, [activeKey]);

  // 事件监听：清理缓存
  useEffect(() => {
    const handleBeforeUnload = () => {
      cacheRef.current.clear();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user-storage') {
        try {
          const userData = JSON.parse(e.newValue || '{}');
          if (!userData.isLogin) {
            cacheRef.current.clear();
          }
        } catch {
          // 忽略解析错误
        }
      }
    };

    // 暴露清除缓存的方法给外部使用
    (window as any).__keepAliveClearCache = (key: string) => {
      cacheRef.current.delete(key);
    };
    (window as any).__keepAliveClearAllCache = () => {
      cacheRef.current.clear();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('storage', handleStorageChange);
      delete (window as any).__keepAliveClearCache;
      delete (window as any).__keepAliveClearAllCache;
    };
  }, []);

  // 获取当前 tab 的 reloadKey（用于强制重新加载）
  const currentTab = tabs.find((tab) => tab.key === activeKey);
  const reloadKey = currentTab?.reloadKey;

  // 使用 useMemo 缓存渲染的组件列表
  const cachedComponents = useMemo(() => {
    const components: React.ReactNode[] = [];

    // 渲染所有缓存的组件，使用 Activity 控制显示/隐藏
    cacheRef.current.forEach((cache, key) => {
      const isVisible = key === activeKey;
      const tab = tabs.find((t) => t.key === key);
      // 使用 reloadKey 作为 key 的一部分，确保 reloadKey 变化时强制重新挂载
      const componentKey = tab?.reloadKey ? `${key}-${tab.reloadKey}` : key;

      components.push(
        <Activity key={componentKey} mode={isVisible ? 'visible' : 'hidden'}>
          {cache.component}
        </Activity>
      );
    });

    // 如果当前页面未缓存（不需要 keepAlive），直接渲染
    const currentCached = cacheRef.current.get(activeKey);
    if (!currentCached && activeKey) {
      components.push(children);
    }

    return components;
  }, [children, tabs.length, reloadKey]); // 添加 reloadKey 到依赖

  return (
    <div ref={containerRef} className="h-full relative flex flex-col p-4">
      {cachedComponents}
    </div>
  );
});

ActivityKeepAlive.displayName = 'ActivityKeepAlive';

export default ActivityKeepAlive;
