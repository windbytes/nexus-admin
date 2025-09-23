import { HttpRequest } from "@/utils/request";
import type { RoleModel } from "../system/role/type";

/**
 * 框架相关接口
 */
const FrameworkApi = {
    /**
   * 根据用户ID获取角色列表
   */
    getUserRolesByUserId: '/sys/framework/queryRolesByUserId',
};

/**
 * 框架相关接口
 */
interface IFrameworkService {
  /**
   * 根据用户ID获取角色列表
   */
  getUserRolesByUserId(userId: string): Promise<RoleModel[]>;
}

/**
 * 框架相关接口实现
 */
export const frameworkService: IFrameworkService = {
  /*
   * 根据用户ID获取角色列表
   * @param userId 用户ID
   * @returns 角色列表
   */
  getUserRolesByUserId(userId: string): Promise<RoleModel[]> {
    return HttpRequest.get(
      {
        url: FrameworkApi.getUserRolesByUserId,
        params: { userId },
        adapter: 'fetch',
      },
      { successMessageMode: 'none' },
    );
  },
};
