import { Outlet } from '@tanstack/react-router';

/**
 * 全屏布局
 *
 * 适用于流程设计器、可视化大屏、低代码编辑器等需要占满整个视口的场景。
 */
export default function FullscreenLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Outlet />
    </div>
  );
}
