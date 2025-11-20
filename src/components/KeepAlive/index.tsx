import { useTabStore } from '@/stores/tabStore';
import React, { Activity, memo, useEffect, useLayoutEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

interface KeepAliveProps {
  children: React.ReactNode;
}

/**
 * 优化后的 KeepAlive
 * * 核心改进：
 * 1. Source of Truth 修正：渲染循环完全由 tabs 数据驱动，而非 cacheRef。
 * 2. 实时快照：在 Render 阶段实时捕获 active 状态的 children 到缓存。
 * 3. 滚动恢复：针对 overflow 容器的滚动位置自动管理。
 * 4. 移除 window 全局污染，改为监听 store 变化或内部生命周期。
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

  // 1. 【关键逻辑】在 Render 过程中更新当前激活页面的缓存
  // 这样保证了当页面从 visible -> hidden 时，我们手头有最新的组件快照
  if (activeKey) {
    componentCacheRef.current.set(activeKey, children);
  }

  // 2. 清理逻辑：当 Tabs 列表发生变化时，清理不再存在的缓存
  useEffect(() => {
    const currentKeys = new Set(tabs.map((t) => t.key));
    
    // 清理组件缓存
    for (const key of componentCacheRef.current.keys()) {
      if (!currentKeys.has(key)) {
        componentCacheRef.current.delete(key);
      }
    }
    
    // 清理滚动缓存
    for (const key of scrollCacheRef.current.keys()) {
      if (!currentKeys.has(key)) {
        scrollCacheRef.current.delete(key);
      }
    }
  }, [tabs]);

  // 3. 滚动位置保存 (在切换前保存)
  // 使用 useRef 记录上一次的 Key，以便在 layoutEffect 中处理
  const lastActiveKeyRef = useRef<string>(activeKey);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const lastKey = lastActiveKeyRef.current;

    // A. 保存离开页面的滚动位置
    if (lastKey && lastKey !== activeKey && container) {
      scrollCacheRef.current.set(lastKey, {
        x: container.scrollLeft,
        y: container.scrollTop,
      });
    }

    // B. 恢复进入页面的滚动位置
    if (activeKey && container) {
      const savedPos = scrollCacheRef.current.get(activeKey);
      if (savedPos) {
        container.scrollTo(savedPos.x, savedPos.y);
      } else {
        container.scrollTo(0, 0);
      }
    }

    lastActiveKeyRef.current = activeKey;
  }, [activeKey]);

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full relative overflow-auto"
      // 添加 overscroll-behavior 防止滚动穿透体验不佳
      style={{ overscrollBehavior: 'contain' }} 
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        const shouldCache = tab.route?.meta?.keepAlive ?? false;
        
        // 如果该页面不需要缓存，且当前不是激活状态，则不渲染任何内容 (彻底卸载)
        if (!shouldCache && !isActive) {
          return null;
        }

        // 计算 key: 加入 reloadKey 以支持强制刷新
        // 当 tab.reloadKey 变化时，React 会认为这是一个新的 key，从而卸载旧组件并重新挂载
        const componentKey = tab.reloadKey 
          ? `${tab.key}-${tab.reloadKey}` 
          : tab.key;

        // 获取要渲染的内容
        // 1. 如果是激活状态：直接渲染传入的 children (由 Router 提供的最新组件)
        // 2. 如果是隐藏状态：从缓存中获取最后一次看到的组件快照
        const content = isActive 
          ? children 
          : componentCacheRef.current.get(tab.key);

        // 既然用了 Activity，我们希望即使是 hidden 状态，DOM 结构也存在
        // React 19 Activity 会自动处理 hidden 时的优先级和资源释放
        return (
          <Activity 
            key={componentKey} 
            mode={isActive ? 'visible' : 'hidden'}
          >
            <div className="h-full w-full p-2">
              {content}
            </div>
          </Activity>
        );
      })}
    </div>
  );
});

KeepAlive.displayName = 'KeepAlive';

export default KeepAlive;