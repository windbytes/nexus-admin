import type { RouteItem } from '@/types/route';
import { HttpRequest } from '@/utils/request';

/**
 * 菜单相关接口枚举
 */
const CommonApi = {
  // 根据token获取菜单（多用于框架上根据角色获取菜单那种）
  getMenuListByRoleId: '/system/menu/getMenusByRole',

  /**
   * 退出登录
   */
  logout: '/logout',

  /**
   * 刷新token
   */
  refreshToken: '/refreshToken',
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
   * 用户退出登录
   */
  logout(): Promise<boolean>;

  /**
   * 刷新token
   */
  refreshToken(): Promise<void>;
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
   * 用户退出登录
   */
  logout(): Promise<boolean> {
    return HttpRequest.post({ url: CommonApi.logout }, { successMessageMode: 'none' });
  },

  /**
   * 刷新token
   */
  refreshToken(): Promise<void> {
    return HttpRequest.post(
      {
        url: CommonApi.refreshToken,
      },
      { successMessageMode: 'none', skipAuthInterceptor: true, isReturnNativeResponse: true }
    );
  },
};
