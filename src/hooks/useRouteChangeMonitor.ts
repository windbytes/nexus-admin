import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

interface RouteChangeMetrics {
  from: string;
  to: string;
  duration: number;
  timestamp: number;
}

/**
 * 路由切换性能监控 Hook
 * 用于监控路由切换的性能，帮助发现性能瓶颈
 * 
 * @param options - 配置选项
 * @param options.enabled - 是否启用监控，默认仅在开发环境启用
 * @param options.onMetric - 指标收集回调函数
 * @param options.threshold - 性能警告阈值（毫秒），超过此值将在控制台输出警告
 */
export const useRouteChangeMonitor = (options?: {
  enabled?: boolean;
  onMetric?: (metric: RouteChangeMetrics) => void;
  threshold?: number;
}) => {
  const {
    enabled = import.meta.env.MODE === 'development',
    onMetric,
    threshold = 300, // 默认300ms作为警告阈值
  } = options || {};

  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const prevPathnameRef = useRef<string>(location.pathname);

  useEffect(() => {
    if (!enabled) return;

    const currentTime = Date.now();
    const duration = currentTime - startTimeRef.current;
    
    // 只有当路径真正改变时才记录
    if (prevPathnameRef.current !== location.pathname) {
      const metric: RouteChangeMetrics = {
        from: prevPathnameRef.current,
        to: location.pathname,
        duration,
        timestamp: currentTime,
      };

      // 调用回调函数
      if (onMetric) {
        onMetric(metric);
      }

      // 在控制台输出性能指标
      const logStyle = duration > threshold 
        ? 'color: #ff4d4f; font-weight: bold;' 
        : 'color: #52c41a;';
      
      console.groupCollapsed(
        `%c[路由性能] ${prevPathnameRef.current} → ${location.pathname}`,
        logStyle
      );
      console.log(`⏱️  切换耗时: ${duration}ms`);
      console.log(`📍 目标路由: ${location.pathname}`);
      console.log(`🕐 时间戳: ${new Date(currentTime).toLocaleTimeString()}`);
      
      if (duration > threshold) {
        console.warn(`⚠️  警告: 路由切换耗时超过阈值 ${threshold}ms`);
        
        // 提供性能优化建议
        console.log('%c💡 优化建议:', 'color: #1890ff; font-weight: bold;');
        console.log('  1. 检查目标页面是否有大量同步计算');
        console.log('  2. 确保组件使用了 React.memo');
        console.log('  3. 检查是否有不必要的 useEffect 执行');
        console.log('  4. 考虑使用代码分割和懒加载');
      }
      
      console.groupEnd();

      // 更新引用
      prevPathnameRef.current = location.pathname;
    }

    // 为下次路由切换重置开始时间
    startTimeRef.current = Date.now();
  }, [location.pathname, enabled, onMetric, threshold]);

  return {
    currentPath: location.pathname,
    previousPath: prevPathnameRef.current,
  };
};

/**
 * Tab 切换性能监控 Hook
 * 用于监控 TabBar 中 tab 切换的性能
 */
export const useTabClickMonitor = () => {
  const clickTimeRef = useRef<number>(0);
  const activeKeyRef = useRef<string>('');

  /**
   * 在 tab 点击时调用，记录点击时间
   */
  const onTabClick = (key: string) => {
    clickTimeRef.current = performance.now();
    activeKeyRef.current = key;
  };

  /**
   * 在 tab 激活状态更新后调用，计算响应时间
   */
  const onTabActivated = (key: string) => {
    if (clickTimeRef.current > 0 && activeKeyRef.current === key) {
      const duration = performance.now() - clickTimeRef.current;
      
      const logStyle = duration > 100 
        ? 'color: #ff4d4f; font-weight: bold;' 
        : 'color: #52c41a;';
      
      console.log(
        `%c[Tab性能] 切换到 ${key} 耗时: ${duration.toFixed(2)}ms`,
        logStyle
      );

      if (duration > 100) {
        console.warn(`⚠️  警告: Tab切换响应时间过长 (${duration.toFixed(2)}ms)`);
      }

      // 重置
      clickTimeRef.current = 0;
      activeKeyRef.current = '';
    }
  };

  return {
    onTabClick,
    onTabActivated,
  };
};

/**
 * 组件渲染性能监控 Hook
 * 监控组件的渲染次数和耗时
 * 
 * @param componentName - 组件名称
 * @param enabled - 是否启用监控
 */
export const useRenderMonitor = (componentName: string, enabled = import.meta.env.MODE === 'development') => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;

    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;

    // 每10次渲染输出一次统计
    if (renderCountRef.current % 10 === 0) {
      console.log(
        `%c[渲染统计] ${componentName} 已渲染 ${renderCountRef.current} 次`,
        'color: #722ed1;'
      );
    }

    // 如果渲染过于频繁（100ms内多次渲染），输出警告
    if (timeSinceLastRender < 100 && renderCountRef.current > 1) {
      console.warn(
        `%c[渲染警告] ${componentName} 在 ${timeSinceLastRender}ms 内重新渲染，可能存在性能问题`,
        'color: #ff4d4f; font-weight: bold;'
      );
    }
  });

  return renderCountRef.current;
};

