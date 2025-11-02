import { useRouterState } from '@tanstack/react-router';
import { useMenuStore } from '@/stores/store';
import { useMemo } from 'react';

/**
 * 获取当前路由的匹配菜单 key
 * TanStack Router 版本
 * @returns 当前菜单 key（如果找不到，则返回 undefined）
 */
export function useCurrentMenuKey(): string | undefined {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { menus } = useMenuStore();

  return useMemo(() => {
    // 递归查找匹配的菜单
    const findMenuKey = (menuList: any[], currentPath: string): string | undefined => {
      for (const menu of menuList) {
        // 直接匹配
        if (menu.path === currentPath) {
          return menu.id;
        }

        // 递归查找子菜单
        if (menu.children && menu.children.length > 0) {
          const found = findMenuKey(menu.children, currentPath);
          if (found) return found;
        }

        // 递归查找子路由
        if (menu.childrenRoute && menu.childrenRoute.length > 0) {
          const found = findMenuKey(menu.childrenRoute, currentPath);
          if (found) return found;
        }
      }
      return undefined;
    };

    return findMenuKey(menus, pathname);
  }, [pathname, menus]);
}
