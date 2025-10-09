import { HttpRequest } from "@/utils/request";
import type { RoleModel } from "../system/role/type";

/**
 * 框架相关接口
 */
const FrameworkApi = {
    /**
   * 根据用户ID获取角色列表
   */
    getUserRolesByUserName: '/sys/framework/queryRolesByUserName',
};

/**
 * 框架相关接口
 */
interface IFrameworkService {
  /**
   * 根据用户名获取角色列表
   */
  getUserRolesByUserName(username: string): Promise<RoleModel[]>;
}

/**
 * 框架相关接口实现
 */
export const frameworkService: IFrameworkService = {
  /*
   * 根据用户ID获取角色列表
   * @param userName 用户名
   * @returns 角色列表
   */
  getUserRolesByUserName(username: string): Promise<RoleModel[]> {
    return HttpRequest.get(
      {
        url: FrameworkApi.getUserRolesByUserName,
        params: { username },
        adapter: 'fetch',
      },
      { successMessageMode: 'none' },
    );
  },
};
