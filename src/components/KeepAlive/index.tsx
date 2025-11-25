import { useTabStore } from '@/stores/tabStore';
import React, { Activity, memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

interface KeepAliveProps {
  children: React.ReactNode;
}

/**
 * 优化后的 KeepAlive
 * * 核心改进（参考 ActivityKeepAlive 的实现）：
 * 1. 遍历缓存而不是 tabs，确保只有已缓存的组件才会被渲染
 * 2. 使用 useMemo 缓存组件列表，减少渲染
 * 3. 直接使用缓存的组件，避免在路由切换时使用新的 children
 * 4. 滚动恢复：针对 overflow 容器的滚动位置自动管理
 */
const KeepAlive: React.FC<KeepAliveProps> = memo(({ children }) => {
  // 使用 shallow 比较，避免非必要渲染
  const { tabs, activeKey } = useTabStore(
    useShallow((state) => ({
      tabs: state.tabs,
      activeKey: state.activeKey,
    }))
  );

  // 缓存已渲染的组件快照 (Map<TabKey, ReactNode>)
  // 这里存的是 ReactElement，用于在 Tab 处于 hidden 状态时"回放"上次的画面
  const componentCacheRef = useRef<Map<string, React.ReactNode>>(new Map());
  
  // 滚动位置缓存
  const scrollCacheRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const prevActiveKeyRef = useRef<string>('');

  // 获取当前页面的 keepAlive 配置
  const shouldCache = tabs.find((tab) => tab.key === activeKey)?.route?.meta?.keepAlive ?? false;

  // 1. 【关键修复】在 useEffect 中更新缓存，而不是在 Render 阶段
  // 这样可以避免在路由切换时，旧的 tab 使用新的 children 导致重新渲染
  useEffect(() => {
    if (!activeKey) return;

    // 保存之前页面的滚动位置
    const previousActiveKey = prevActiveKeyRef.current;
    if (previousActiveKey && previousActiveKey !== activeKey && containerRef.current) {
      const cached = componentCacheRef.current.get(previousActiveKey);
      if (cached) {
        scrollCacheRef.current.set(previousActiveKey, {
          x: containerRef.current.scrollLeft,
          y: containerRef.current.scrollTop,
        });
      }
    }
    prevActiveKeyRef.current = activeKey;

    // 处理当前页面的缓存
    if (shouldCache) {
      // 如果缓存不存在或 children 变化了，更新缓存
      const cached = componentCacheRef.current.get(activeKey);
      if (!cached || cached !== children) {
        componentCacheRef.current.set(activeKey, children);
      }
    } else {
      // 不需要缓存的页面，删除可能存在的旧缓存
      componentCacheRef.current.delete(activeKey);
    }

    // 清理不存在的 tab 对应的缓存
    const tabKeys = new Set(tabs.map((tab) => tab.key));
    for (const key of componentCacheRef.current.keys()) {
      if (!tabKeys.has(key)) {
        componentCacheRef.current.delete(key);
      }
    }
  }, [activeKey, shouldCache, tabs, children]);

  // 2. 恢复滚动位置 - 使用 useLayoutEffect 防止闪烁
  useLayoutEffect(() => {
    if (!activeKey || !containerRef.current) return;

    const savedPos = scrollCacheRef.current.get(activeKey);
    if (savedPos) {
      containerRef.current.scrollTop = savedPos.y;
      containerRef.current.scrollLeft = savedPos.x;
    } else {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [activeKey]);

  // 获取当前 tab 的 reloadKey（用于强制重新加载）
  const currentTab = tabs.find((tab) => tab.key === activeKey);
  const reloadKey = currentTab?.reloadKey;

  // 3. 【关键修复】使用 useMemo 缓存组件列表，遍历缓存而不是 tabs
  // 这样可以确保只有已缓存的组件才会被渲染，避免在路由切换时使用新的 children
  const cachedComponents = useMemo(() => {
    const components: React.ReactNode[] = [];

    // 渲染所有缓存的组件，使用 Activity 控制显示/隐藏
    componentCacheRef.current.forEach((cachedComponent, key) => {
      const isVisible = key === activeKey;
      const tab = tabs.find((t) => t.key === key);
      // 使用 reloadKey 作为 key 的一部分，确保 reloadKey 变化时强制重新挂载
      const componentKey = tab?.reloadKey ? `${key}-${tab.reloadKey}` : key;

      components.push(
        <Activity key={componentKey} mode={isVisible ? 'visible' : 'hidden'}>
          {cachedComponent}
        </Activity>,
      );
    });

    // 如果当前页面未缓存（不需要 keepAlive），直接渲染
    const currentCached = componentCacheRef.current.get(activeKey);
    if (!currentCached && activeKey) {
      components.push(children);
    }

    return components;
  }, [activeKey, tabs.length, reloadKey, children]);

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full relative overflow-auto"
      // 添加 overscroll-behavior 防止滚动穿透体验不佳
      style={{ overscrollBehavior: 'contain' }} 
    >
      {cachedComponents}
    </div>
  );
});

KeepAlive.displayName = 'KeepAlive';

export default KeepAlive;