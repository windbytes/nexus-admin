import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoadedTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

interface PerformanceObserver {
  disconnect: () => void;
}

/**
 * 性能监控 Hook
 * 监控页面加载性能和用户体验指标
 */
export const usePerformance = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    loadTime: 0,
    domContentLoadedTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
  });

  const observersRef = useRef<PerformanceObserver[]>([]);

  // 获取基本性能指标
  const getBasicMetrics = useCallback(() => {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metricsRef.current.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      metricsRef.current.domContentLoadedTime = 
        navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
    }
  }, []);

  // 监控 Web Vitals
  const observeWebVitals = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metricsRef.current.firstContentfulPaint = fcpEntry.startTime;
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
    observersRef.current.push(fcpObserver);

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metricsRef.current.largestContentfulPaint = lastEntry.startTime;
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    observersRef.current.push(lcpObserver);

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          metricsRef.current.firstInputDelay = entry.processingStart - entry.startTime;
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    observersRef.current.push(fidObserver);

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          metricsRef.current.cumulativeLayoutShift = clsValue;
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    observersRef.current.push(clsObserver);
  }, []);

  // 监控资源加载性能
  const observeResourceTiming = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 1000) {
          console.warn('慢资源加载:', {
            name: entry.name,
            duration: entry.duration,
            size: (entry as any).transferSize || 0,
          });
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
    observersRef.current.push(resourceObserver);
  }, []);

  // 监控长任务
  const observeLongTasks = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.warn('长任务检测:', {
          duration: entry.duration,
          startTime: entry.startTime,
        });
      });
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
    observersRef.current.push(longTaskObserver);
  }, []);

  // 获取当前性能指标
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  // 上报性能数据
  const reportMetrics = useCallback((endpoint?: string) => {
    const metrics = getMetrics();
    
    // 在开发环境下打印到控制台
    if ( import.meta.env.MODE === 'development') {
      console.log('性能指标:', metrics);
    }

    // 在生产环境下可以上报到监控服务
    if (import.meta.env.MODE === 'production' && endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metrics,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch((error) => {
        console.error('性能数据上报失败:', error);
      });
    }
  }, [getMetrics]);

  // 清理观察器
  const cleanup = useCallback(() => {
    observersRef.current.forEach((observer) => {
      observer.disconnect();
    });
    observersRef.current = [];
  }, []);

  useEffect(() => {
    // 页面加载完成后获取基本指标
    const handleLoad = () => {
      getBasicMetrics();
    };

    // 立即开始监控
    observeWebVitals();
    observeResourceTiming();
    observeLongTasks();

    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('load', handleLoad);
      cleanup();
    };
  }, [getBasicMetrics, observeWebVitals, observeResourceTiming, observeLongTasks, cleanup]);

  return {
    getMetrics,
    reportMetrics,
    cleanup,
  };
};

/**
 * 组件性能监控 Hook
 * 监控组件的渲染性能
 */
export const useComponentPerformance = (componentName: string) => {
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  const startRender = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartRef.current > 0) {
      const renderTime = performance.now() - renderStartRef.current;
      renderCountRef.current += 1;

      if (renderTime > 16) { // 超过一帧的时间
        console.warn(`${componentName} 渲染时间过长:`, renderTime, 'ms');
      }

      if (import.meta.env.MODE === 'development') {
        console.log(`${componentName} 渲染时间:`, renderTime, 'ms', `(第${renderCountRef.current}次渲染)`);
      }
    }
  }, [componentName]);

  return {
    startRender,
    endRender,
    renderCount: renderCountRef.current,
  };
};

export default usePerformance;
