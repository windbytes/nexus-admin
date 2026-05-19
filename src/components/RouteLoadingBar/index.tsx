import { theme } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

/**
 * 全局路由加载进度条
 *
 * 基于路由变化触发进度动画：
 * 1. pathname 变化时启动进度条
 * 2. 使用 "Trickle" 算法模拟加载进度
 * 3. 路由切换完成后冲刺到 100% 并淡出
 */
const RouteLoadingBar = memo(() => {
  const { token } = theme.useToken();
  const { pathname } = useLocation();

  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathnameRef = useRef(pathname);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevPathnameRef.current = pathname;
      return;
    }

    if (pathname === prevPathnameRef.current) {
      return;
    }

    prevPathnameRef.current = pathname;

    const clearTicker = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    clearTicker();
    setOpacity(1);
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return prev;
        }
        const diff = Math.max(0, (90 - prev) / 10);
        const step = Math.random() * 2 + 1;
        return Math.min(prev + Math.max(step, diff), 90);
      });
    }, 50);

    const completeTimer = setTimeout(() => {
      clearTicker();
      setProgress(100);

      setTimeout(() => {
        setOpacity(0);
        setTimeout(() => setProgress(0), 300);
      }, 200);
    }, 300);

    return () => {
      clearTicker();
      clearTimeout(completeTimer);
    };
  }, [pathname]);

  if (opacity === 0 && progress === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-9999 pointer-events-none">
      <div
        style={{
          height: '2px',
          background: token.colorPrimary,
          width: `${progress}%`,
          opacity: opacity,
          transition: 'width 200ms ease-out, opacity 300ms ease-out',
          boxShadow: `0 0 10px ${token.colorPrimary}`,
        }}
      />
    </div>
  );
});

RouteLoadingBar.displayName = 'RouteLoadingBar';

export default RouteLoadingBar;
