import type React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useUserStore } from '@/stores/userStore';
/**
 * 前置路由拦截（判定用户是否 处于登录状态）
 * @returns
 */
interface AuthRouterProps {
  children: React.ReactElement;
}

/**
 * 授权路由
 * @param param0
 * @returns
 */
export default function AuthRouter({ children }: AuthRouterProps) {
  const { isLogin, homePath } = useUserStore();
  const location = useLocation();

  if (!isLogin) {
    // 未登录，允许访问登录页
    if (location.pathname !== '/login') {
      return <Navigate to="/login" replace />;
    }
  } else {
    // 已登录访问 "/"，自动跳转到首页
    if (location.pathname === '/') {
      return <Navigate to={homePath} replace />;
    }
  }

  return children;
}
