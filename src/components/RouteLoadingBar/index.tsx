import { useLocation } from '@tanstack/react-router';
import { Progress } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';
import './styles.scss';

/**
 * 全局路由加载进度条
 *
 * 功能：
 * 1. 在路由切换时显示顶部进度条
 * 2. 监听 location 变化触发进度条
 * 3. 模拟进度增长效果
 * 4. 完成后自动隐藏
 *
 * 优化：
 * - 不使用 useNavigation（需要数据路由支持）
 * - 直接监听 useLocation 变化
 * - 使用 useTransition 状态（由 MenuComponent 提供）
 */
const RouteLoadingBar = memo(() => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathnameRef = useRef(location.pathname);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // 清理所有定时器
  const clearAllTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  useEffect(() => {
    // 检测路由是否真的变化了
    if (prevPathnameRef.current === location.pathname) {
      return;
    }

    // 清理之前的定时器
    clearAllTimers();

    // 路由开始变化，显示进度条
    setVisible(true);
    setProgress(10);

    // 模拟进度增长
    const timer1 = setTimeout(() => setProgress(30), 50);
    const timer2 = setTimeout(() => setProgress(50), 150);
    const timer3 = setTimeout(() => setProgress(70), 300);
    const timer4 = setTimeout(() => setProgress(90), 500);

    timersRef.current = [timer1, timer2, timer3, timer4];

    // 设置最大等待时间，避免进度条一直显示
    const maxWaitTimer = setTimeout(() => {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
        prevPathnameRef.current = location.pathname;
      }, 400);
      timersRef.current.push(hideTimer);
    }, 2000); // 最多显示2秒

    timersRef.current.push(maxWaitTimer);

    return () => {
      clearAllTimers();
    };
  }, [location.pathname]);

  // 监听页面加载完成（通过 window.performance）
  useEffect(() => {
    if (!visible) return;

    // 使用 requestIdleCallback 或 setTimeout 检测页面是否加载完成
    const checkComplete = () => {
      // 简单判断：如果路径已经变化了，认为加载完成
      if (progress < 100) {
        setProgress(100);
        const hideTimer = setTimeout(() => {
          setVisible(false);
          setProgress(0);
          prevPathnameRef.current = location.pathname;
        }, 300);
        timersRef.current.push(hideTimer);
      }
    };

    // 延迟检查，给页面渲染一些时间
    const timer = setTimeout(checkComplete, 800);
    timersRef.current.push(timer);

    return () => clearTimeout(timer);
  }, [visible, progress, location.pathname]);

  if (!visible) return null;

  return (
    <div className="route-loading-bar">
      <Progress
        percent={progress}
        showInfo={false}
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
        strokeWidth={3}
        status="active"
      />
    </div>
  );
});

RouteLoadingBar.displayName = 'RouteLoadingBar';

export default RouteLoadingBar;
