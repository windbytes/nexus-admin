import { useMenuStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';

/**
 * 结合当前菜单权限，判断用户是否有权限
 * @param requiredPermissions 需要检查的权限数组
 * @param mode "AND"（必须全部匹配） | "OR"（只需匹配一个）
 * @returns {boolean} 是否有权限
 */
export function usePermission(requiredPermissions: string[], mode: 'AND' | 'OR' = 'OR'): boolean {
  const { buttonPermissions } = useMenuStore();
  const { loginUser } = useUserStore();
  // 判断是否是管理员
  const isAdmin = loginUser === 'admin';
  if (isAdmin) {
    return true;
  }
  if (mode === 'AND') {
    return requiredPermissions.every((perm) => buttonPermissions.includes(perm));
  }
  return requiredPermissions.some((perm) => buttonPermissions.includes(perm));
}
