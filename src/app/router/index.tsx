import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Spin } from 'antd';
import { commonService } from '@/shared/api/common';
import { useMenuStore } from '@/shared/stores/preferences.store';
import { useUserStore } from '@/shared/stores/user.store';
import type { RouteItem } from '@/types/route';
import { defaultMenus } from './default-menus';
import { buildRouteTree } from './routeTree';

/** 基于菜单数据构建 TanStack Router 实例 */
function buildRouter(menus: RouteItem[]) {
  return createRouter({
    routeTree: buildRouteTree(menus),
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  });
}

/**
 * 路由系统入口
 *
 * 职责：
 * - 登录后按角色拉取菜单与按钮权限，写入菜单 store；无后端时回退内置演示菜单；
 * - 依据菜单数据用 @tanstack/react-router 构建路由树，BasicLayout 作为受保护根布局；
 * - 仅当菜单引用变化时同步重建 router 实例，避免每次渲染重建整棵路由树，
 *   也避免「菜单更新后仍渲染旧 router」导致的 404 闪烁。
 */
export function AppRouter() {
  const isLogin = useUserStore((state) => state.isLogin);
  const roleId = useUserStore((state) => state.roleId);

  const menus = useMenuStore((state) => state.menus);
  const setMenus = useMenuStore((state) => state.setMenus);
  const setButtonPermissions = useMenuStore((state) => state.setButtonPermissions);

  // 登录态下按角色加载菜单 + 按钮权限
  const { isFetching } = useQuery({
    queryKey: ['app-permission-data', roleId],
    queryFn: async () => {
      try {
        const [menuList, permissions] = await Promise.all([
          commonService.getMenuListByRoleId(roleId),
          commonService.getPermissionsByRoleId(roleId),
        ]);
        setMenus(menuList ?? []);
        setButtonPermissions(permissions ?? []);
        return menuList ?? [];
      } catch {
        // 无后端（本地开发）时回退到内置演示菜单，保证登录后可直接预览页面
        setMenus(defaultMenus);
        setButtonPermissions([]);
        return defaultMenus;
      }
    },
    enabled: isLogin && !!roleId,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const router = buildRouter(menus);

  // 已登录但菜单尚未就绪时展示加载态
  if (isLogin && roleId && isFetching && menus.length === 0) {
    return (
      <div className="flex h-full min-h-100 w-full items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} size="large" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
