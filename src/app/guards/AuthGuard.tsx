import { redirect } from '@tanstack/react-router';
import { useUserStore } from '@/shared/stores/user.store';

/**
 * 登录态守卫
 *
 * 校验当前用户是否已登录，未登录时跳转登录页并记录回跳地址。
 * 作为受保护布局路由的 beforeLoad 使用。
 */
export function ensureAuthenticated(currentHref: string): void {
  const { isLogin } = useUserStore.getState();
  if (!isLogin) {
    throw redirect({
      to: '/login',
      search: { redirect: currentHref },
    });
  }
}

/**
 * 登录页反向守卫
 *
 * 已登录用户访问登录页时，直接回到首页（或回跳地址）。
 */
export function ensureGuest(redirectTo?: string): void {
  const { isLogin, homePath } = useUserStore.getState();
  if (isLogin) {
    throw redirect({ to: redirectTo || homePath || '/home' });
  }
}

/**
 * 根路径重定向
 *
 * 访问 `/` 时按登录态分流到首页或登录页。
 */
export function resolveRootRedirect(): never {
  const { isLogin, homePath } = useUserStore.getState();
  throw redirect({ to: isLogin ? homePath || '/home' : '/login' });
}
