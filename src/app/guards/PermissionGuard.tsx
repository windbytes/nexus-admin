import { redirect } from '@tanstack/react-router';
import { useMenuStore } from '@/shared/stores/preferences.store';
import { useUserStore } from '@/shared/stores/user.store';
import { findMenuByPath } from '@/shared/utils/utils';
import type { RouteMeta } from '@/types/route';

/**
 * 权限点守卫
 *
 * 基于登录态 + 菜单可达性 + 权限码控制路由访问，
 * 对应 syndra-admin 中 RoutePermissionGuard 的逻辑。
 * 作为动态路由的 beforeLoad 使用。
 */
export function ensurePermission(meta: RouteMeta | undefined, pathname: string): void {
  const { isLogin, loginUser } = useUserStore.getState();

  if (!isLogin) {
    throw redirect({ to: '/login', search: { redirect: pathname } });
  }

  // 忽略授权 / 无需鉴权的路由直接放行
  if (meta?.ignoreAuth || !meta?.requiresAuth) {
    return;
  }

  // 超级管理员放行
  if (loginUser === 'admin') {
    return;
  }

  // 校验菜单是否可达
  const { caches } = useMenuStore.getState();
  const currentMenu = findMenuByPath(pathname, caches);
  if (!currentMenu) {
    throw redirect({ to: '/403', search: { from: pathname } });
  }
}
