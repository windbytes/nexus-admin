import { useMenuStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import { findMenuByPath } from '@/utils/utils';
import { useLocation } from 'react-router';

/**
 * 结合当前菜单权限，判断用户是否有权限
 * @param requiredPermissions 需要检查的权限数组
 * @param mode "AND"（必须全部匹配） | "OR"（只需匹配一个）
 * @returns {boolean} 是否有权限
 */
export function usePermission(requiredPermissions: string[], mode: 'AND' | 'OR' = 'OR'): boolean {
  const { caches: menuCaches } = useMenuStore();
  const { loginUser } = useUserStore();
  // 当前路由的pathname
  const { pathname } = useLocation();
  // 获取当前菜单的权限（如果传入了 currentMenuKey）
  const currentMenu = findMenuByPath(pathname, menuCaches);
  const menuPermission = currentMenu?.meta?.permissionList || []; // 例如："user:view"
  // 判断是否是管理员
  const isAdmin = loginUser === 'admin';
  if (isAdmin) {
    return true;
  }
  if (mode === 'AND') {
    return requiredPermissions.every((perm) => menuPermission.includes(perm));
  }
  return requiredPermissions.some((perm) => menuPermission.includes(perm));
}
