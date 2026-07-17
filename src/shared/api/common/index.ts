import type { RouteItem } from '@/types/route';
import { HttpRequest } from '@/shared/utils/request';

/**
 * 菜单相关接口枚举
 */
const CommonApi = {
  // 根据token获取菜单（多用于框架上根据角色获取菜单那种）
  getMenuListByRoleId: '/system/menu/getMenusByRole',

  // 获取角色配置的权限点（按钮权限）
  getButtonPermissionsByRoleId: '/system/permission/getButtonPermissionsByRoleId',

  /**
   * 退出登录
   */
  logout: '/auth/logout',

  /**
   * 刷新token
   */
  refreshToken: '/auth/refresh',
};

/**
 * 菜单管理服务接口
 */
interface ICommonService {
  /**
   * 根据角色获取菜单
   * @param roleId 角色ID
   * @returns 菜单列表
   */
  getMenuListByRoleId(roleId: string): Promise<RouteItem[]>;

  /**
   * 获取角色配置的权限点（按钮权限）
   * @param roleId
   */
  getPermissionsByRoleId(roleId: string): Promise<string[]>;

  /**
   * 用户退出登录
   */
  logout(): Promise<boolean>;

  /**
   * 刷新token
   */
  refreshToken(): Promise<string>;
}

/**
 * 菜单管理服务实现
 */
export const commonService: ICommonService = {
  /**
   * 根据角色获取菜单
   * @param roleId 角色ID
   * @returns 菜单列表
   */
  getMenuListByRoleId(roleId: string): Promise<RouteItem[]> {
    return HttpRequest.get(
      {
        url: CommonApi.getMenuListByRoleId,
        params: { roleId },
        adapter: 'fetch',
      },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 获取角色配置的权限点（按钮权限）
   * @param roleId
   * @returns 权限点列表
   */
  getPermissionsByRoleId(roleId: string): Promise<string[]> {
    return HttpRequest.get(
      { url: CommonApi.getButtonPermissionsByRoleId, params: { roleId }, adapter: 'fetch' },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 用户退出登录
   */
  logout(): Promise<boolean> {
    return HttpRequest.post({ url: CommonApi.logout }, { successMessageMode: 'none' });
  },

  /**
   * 刷新token
   */
  refreshToken(): Promise<string> {
    return HttpRequest.post<string>(
      {
        url: CommonApi.refreshToken,
      },
      { successMessageMode: 'none', skipAuthInterceptor: true }
    );
  },
};
