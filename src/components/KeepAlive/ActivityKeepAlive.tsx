import { useTabStore } from '@/stores/tabStore';
import LRUCache from '@/utils/LRUCache';
import React, { Activity, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
 * 优化点：
 * 1. LRU缓存机制：自动淘汰最久未使用的页面
 * 2. useLayoutEffect恢复滚动：在浏览器绘制前执行，防止闪烁
 * 3. 智能处理children更新：只有在key变化时才更新缓存
 *
 * @param children - 子组件
 * @returns
 */
const ActivityKeepAlive: React.FC<ActivityKeepAliveProps> = ({ children }) => {
  const { tabs, activeKey } = useTabStore();
  const cacheRef = useRef(new LRUCache<string, CacheItem>(10));
  const [currentComponent, setCurrentComponent] = useState<React.ReactElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevActiveKeyRef = useRef<string>('');
  const currentChildrenRef = useRef<React.ReactNode>(children);
  const prevChildrenRef = useRef<React.ReactNode>(children);

  // 检测children是否真的变化了
  const childrenChangedRef = useRef(false);

  useEffect(() => {
    // 只有当children的引用变化时才认为是变化
    if (prevChildrenRef.current !== children) {
      childrenChangedRef.current = true;
      prevChildrenRef.current = children;
    }
    currentChildrenRef.current = children;
  });

  // 获取当前页面的 keepAlive 配置
  const shouldCache = tabs.find((tab) => tab.key === activeKey)?.route?.meta?.keepAlive === true;

  // 滚动位置恢复标志
  const scrollRestoreFlagRef = useRef<{ key: string; scrollTop: number; scrollLeft: number } | null>(null);

  // 【优化】合并所有逻辑到单个 useEffect，减少渲染次数
  useEffect(() => {
    if (!activeKey) return;

    // 1. 保存之前页面的滚动位置
    const previousActiveKey = prevActiveKeyRef.current;
    if (previousActiveKey && previousActiveKey !== activeKey && containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const scrollLeft = containerRef.current.scrollLeft;
      const cached = cacheRef.current.get(previousActiveKey);
      if (cached) {
        cached.scrollTop = scrollTop;
        cached.scrollLeft = scrollLeft;
      }
    }
    prevActiveKeyRef.current = activeKey;

    // 2. 处理当前页面的缓存和渲染
    if (shouldCache) {
      // 需要缓存的页面
      let cached = cacheRef.current.get(activeKey);

      // 【优化】只在key变化或children变化时更新缓存
      if (!cached || (childrenChangedRef.current && cached.component !== currentChildrenRef.current)) {
        // 创建或更新缓存
        cached = {
          component: currentChildrenRef.current as React.ReactElement,
          scrollTop: 0,
          scrollLeft: 0,
        };
        cacheRef.current.set(activeKey, cached);
        childrenChangedRef.current = false;
      }

      setCurrentComponent(cached.component);

      // 设置滚动恢复标志（在useLayoutEffect中使用）
      scrollRestoreFlagRef.current = {
        key: activeKey,
        scrollTop: cached.scrollTop,
        scrollLeft: cached.scrollLeft,
      };
    } else {
      // 不需要缓存的页面，直接渲染
      setCurrentComponent(currentChildrenRef.current as React.ReactElement);

      // 清除可能存在的旧缓存
      cacheRef.current.delete(activeKey);
      scrollRestoreFlagRef.current = null;
    }

    // 3. 清理不存在的 tab 对应的缓存
    const tabKeys = tabs.map((tab) => tab.key);
    cacheRef.current.forEach((_, key) => {
      if (!tabKeys.includes(key)) {
        cacheRef.current.delete(key);
      }
    });

    // 【优化】LRU缓存自动处理淘汰，无需手动清理
  }, [activeKey, shouldCache, tabs]);

  // 【优化】使用 useLayoutEffect 恢复滚动位置，防止闪烁
  useLayoutEffect(() => {
    if (scrollRestoreFlagRef.current && containerRef.current) {
      const { scrollTop, scrollLeft } = scrollRestoreFlagRef.current;
      containerRef.current.scrollTop = scrollTop;
      containerRef.current.scrollLeft = scrollLeft;
      scrollRestoreFlagRef.current = null;
    }
  });

  // 【优化】合并事件监听到一个 useEffect
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
        } catch (error) {
          // 解析失败，忽略
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

  if (!currentComponent) {
    return null;
  }

  // 使用React 19.2的Activity组件来实现keepalive功能
  return (
    <div ref={containerRef} className="h-full relative flex flex-col p-4">
      <Activity mode={activeKey ? 'visible' : 'hidden'}>{currentComponent}</Activity>
    </div>
  );
};

export default React.memo(ActivityKeepAlive);
