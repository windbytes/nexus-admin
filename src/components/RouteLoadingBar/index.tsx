import { useRouterState } from '@tanstack/react-router';
import { theme } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';

/**
 * 全局路由加载进度条 (优化版)
 *
 * 核心改进：
 * 1. 数据源：从 useLocation (路由变后) 改为 useRouterState.isLoading (路由变前)
 * 2. 动画：使用 "Trickle" 算法（快速到30%，慢速到90%，结束冲刺100%）
 * 3. 性能：原生 DOM 渲染，移除不必要的重渲染和复杂的 Timer 数组管理
 */
const RouteLoadingBar = memo(() => {
  const { token } = theme.useToken();
  
  // 1. 精准订阅路由的加载状态
  // select 确保只有当 isLoading 变化时才触发重渲染
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 清理函数：组件卸载或状态变化时停止之前的计时器
    const clearTicker = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (isLoading) {
      // === 阶段一：开始加载 ===
      clearTicker();
      setOpacity(1);
      setProgress(0);

      // 启动"虚假进度"定时器：模拟进度不断增加，但永远不到 100%
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          // 如果已经到了 90%，就停在那里等待真正的加载完成
          if (prev >= 90) return prev;
          
          // 随机增加一点进度，模拟非线性加载，越往后越慢
          const diff = Math.max(0, (90 - prev) / 10); 
          // 保证每次至少加 1%，且带有随机性
          const step = Math.random() * 2 + 1; 
          
          return Math.min(prev + Math.max(step, diff), 90);
        });
      }, 100);

    } else {
      // === 阶段二：加载完成 ===
      clearTicker();

      // 只有当进度条当前是显示状态（或者有进度）时，才执行完成动画
      // 避免页面初始化时 isLoading 为 false 导致的闪烁
      if (opacity > 0 || progress > 0) {
        setProgress(100); // 瞬间冲刺到 100%

        // 延迟消失，让用户看到 100% 的状态
        const hideTimer = setTimeout(() => {
          setOpacity(0);
          
          // 动画结束后重置（配合 CSS transition duration）
          setTimeout(() => {
            setProgress(0);
          }, 300); 
        }, 200);

        return () => clearTimeout(hideTimer);
      }
    }

    return clearTicker;
  }, [isLoading]); // 仅依赖 isLoading 变化

  // 如果完全不可见且进度归零，不渲染 DOM
  if (opacity === 0 && progress === 0) return null;

  return (
    <div 
      className="route-loading-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999, // 确保在所有层级之上（包括 Modal）
        pointerEvents: 'none', // 避免遮挡鼠标点击
      }}
    >
      <div
        style={{
          height: '2px', // 极细线条，比 Antd Progress 更精致
          background: token.colorPrimary, // 保持使用 Antd 主题色
          width: `${progress}%`,
          opacity: opacity,
          transition: 'width 200ms ease-out, opacity 300ms ease-out', // 丝滑动画关键
          boxShadow: `0 0 10px ${token.colorPrimary}`, // 增加一点发光效果，看起来更高级
        }}
      />
    </div>
  );
});

RouteLoadingBar.displayName = 'RouteLoadingBar';

export default RouteLoadingBar;