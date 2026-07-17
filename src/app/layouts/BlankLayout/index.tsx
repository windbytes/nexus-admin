import { Outlet } from '@tanstack/react-router';

/**
 * 空白布局
 *
 * 不含侧边栏 / Header 的极简布局，
 * 适用于登录页、注册页、忘记密码、404 等独立页面。
 */
export default function BlankLayout() {
  return (
    <div className="h-full w-full">
      <Outlet />
    </div>
  );
}
