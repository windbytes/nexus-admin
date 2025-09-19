import { HttpRequest } from '@/utils/request';
import type { RoleMenu, RoleModel, RoleSearchParams, UserSearchParams } from './type';
import type { PageResult } from '@/types/global';

/**
 * 枚举角色相关的api
 */
const RoleApi = {
  /**
   * 获取角色列表（分页查询）
   */
  getRoleListPage: '/system/role/getRoleListPage',
  /**
   * 获取角色详情
   */
  getRoleDetail: '/system/role/detail',
  /**
   * 新增角色
   */
  addRole: '/system/role/addRole',
  /**
   * 编辑角色
   */
  editRole: '/system/role/editRole',

  /**
   * 改变角色状态
   */
  changeStatus: '/system/role/changeStatus',

  /**
   * 批量删除角色（物理删除）
   */
  deleteBatchRoles: '/system/role/deleteBatchRoles',

  /**
   * 批量删除角色（逻辑删除）
   */
  logicDeleteBatchRoles: '/system/role/logicDeleteBatchRoles',

  /**
   * 获取角色菜单
   */
  getRoleMenu: '/system/role/getRoleMenu',

  /**
   * 获取角色用户
   */
  getRoleUser: '/system/role/getRoleUser',

  /**
   * 获取不在该角色下的所有可用用户
   */
  getUserNotInRoleByPage: '/system/role/getUserNotInRoleByPage',

  /**
   * 给角色分配菜单
   */
  assignRoleMenu: '/system/role/assignRoleMenu',

  /**
   * 给角色分配用户
   */
  assignRoleUser: '/system/role/assignRoleUser',

  /**
   * 校验角色编码是否重复
   */
  checkRoleCodeExist: '/system/role/checkRoleCodeExist',
};

/**
 * 角色管理服务接口
 */
export interface IRoleService {
  /**
   * 获取不在该角色下的所有可用用户
   */
  getRoleDetail(roleId: string): Promise<RoleModel>;
  /**
   * 获取角色列表（包含分页数据）
   * @param params 角色参数(包含分页信息)
   * @returns 角色列表
   */
  getRoleListPage(params: RoleSearchParams): Promise<PageResult<RoleModel>>;

  /**
   * 新增角色
   * @param params 角色参数
   * @returns 结果
   */
  addRole(params: Partial<RoleModel>): Promise<boolean>;

  /**
   * 编辑角色信息
   * @param params 角色参数
   * @returns 结果
   */
  editRole(params: Partial<RoleModel>): Promise<boolean>;

  /**
   * 更新角色状态
   * @param params 角色参数
   * @returns 结果
   */
  changeStatus(params: Partial<RoleModel>): Promise<boolean>;

  /**
   * 物理批量删除角色
   * @param ids 角色id
   * @returns 结果
   */
  deleteBatchRole(ids: string[]): Promise<boolean>;

  /**
   * 逻辑批量删除角色
   * @param ids 角色id
   * @returns 结果
   */
  logicDeleteBatchRole(ids: string[]): Promise<boolean>;

  /**
   * 获取角色菜单权限
   * @param params 角色参数
   * @returns 菜单权限列表
   */
  getRoleMenu(roleId: string): Promise<RoleMenu>;

  /**
   * 分配角色菜单权限
   * @param roleId 角色ID
   * @param menuIds 菜单ID列表
   * @returns 结果
   */
  assignRoleMenu(roleId: string, menuIds: string[]): Promise<boolean>;

  /**
   * 分配角色用户
   * @param roleId 角色id
   * @param userIds 用户id列表
   * @param operate 操作类型（add、remove）
   * @returns 结果
   */
  assignRoleUser(roleId: string, userIds: string[], operate: string): Promise<boolean>;

  /**
   * 获取角色用户
   * @param roleId 角色ID
   * @param params 用户查询参数和分页参数
   * @returns 结果
   */
  getRoleUser(roleId: string, params: UserSearchParams): Promise<Record<string, any>>;

  /**
   * 获取不在该角色下的所有可用用户，包括分页结果
   * @param roleId 角色ID
   * @param params 用户查询参数和分页参数
   * @returns 结果
   */
  getUserNotInRoleByPage(roleId: string, params: UserSearchParams): Promise<Record<string, any>>;

  /**
   * 校验角色编码是否存在
   * @param roleCode 角色编码
   * @returns 结果
   */
  checkRoleCodeExist(roleCode: string): Promise<boolean>;
}

/**
 * 角色管理服务实现
 */
export const roleService: IRoleService = {
  /**
   * 获取角色详情
   * @param roleId 角色ID
   * @returns 角色详情
   */
  async getRoleDetail(roleId: string): Promise<RoleModel> {
    return await HttpRequest.get(
      {
        url: RoleApi.getRoleDetail,
        params: { roleId },
        adapter: 'fetch',
      },
      {
        successMessageMode: 'none',
      },
    );
  },
  /**
   * 获取角色列表（包含分页数据）
   * @param params 角色参数(包含分页信息)
   * @returns 角色列表
   */
  async getRoleListPage(params: RoleSearchParams): Promise<PageResult<RoleModel>> {
    return await HttpRequest.post<PageResult<RoleModel>>(
      {
        url: RoleApi.getRoleListPage,
        data: params,
      },
      {
        successMessageMode: 'none',
      },
    );
  },

  /**
   * 新增角色
   * @param params 角色参数
   * @returns 结果
   */
  async addRole(params: Partial<RoleModel>): Promise<boolean> {
    return await HttpRequest.post({
      url: RoleApi.addRole,
      data: params,
    });
  },
  /**
   * 编辑角色信息
   * @param params 角色参数
   * @returns 结果
   */
  async editRole(params: Partial<RoleModel>): Promise<boolean> {
    return await HttpRequest.post({
      url: RoleApi.editRole,
      data: params,
    });
  },

  /**
   * 更新角色状态
   * @param params 角色参数
   * @returns 结果
   */
  async changeStatus(params: Partial<RoleModel>): Promise<boolean> {
    return await HttpRequest.patch({
      url: RoleApi.changeStatus,
      data: params,
    });
  },
  /**
   * 物理批量删除角色
   * @param ids 角色id
   * @returns 结果
   */
  async deleteBatchRole(ids: string[]): Promise<boolean> {
    return await HttpRequest.delete({
      url: RoleApi.deleteBatchRoles,
      data: ids,
    });
  },

  /**
   * 逻辑批量删除角色
   * @param ids 角色id
   * @returns 结果
   */
  async logicDeleteBatchRole(ids: string[]): Promise<boolean> {
    return await HttpRequest.delete({
      url: RoleApi.logicDeleteBatchRoles,
      data: ids,
    });
  },
  /**
   * 获取角色菜单权限
   * @param params 角色参数
   * @returns 菜单权限列表
   */
  async getRoleMenu(roleId: string): Promise<RoleMenu> {
    return await HttpRequest.get(
      {
        url: RoleApi.getRoleMenu,
        params: { roleId },
      },
      {
        successMessageMode: 'none',
      },
    );
  },
  /**
   * 分配角色菜单权限
   * @param roleId 角色ID
   * @param menuIds 菜单ID列表
   * @returns 结果
   */
  async assignRoleMenu(roleId: string, menuIds: string[]): Promise<boolean> {
    return await HttpRequest.post({
      url: RoleApi.assignRoleMenu,
      data: { roleId, menuIds },
    });
  },
  /**
   * 分配角色用户
   * @param roleId 角色id
   * @param userIds 用户id列表
   * @param operate 操作类型（add、remove）
   * @returns 结果
   */
  async assignRoleUser(roleId: string, userIds: string[], operate: string): Promise<boolean> {
    return await HttpRequest.post(
      {
        url: RoleApi.assignRoleUser,
        data: { roleId, userIds, operate },
      },
      {
        successMessageMode: 'none',
      },
    );
  },
  /**
   * 获取角色用户
   * @param roleId 角色ID
   * @param params 用户查询参数和分页参数
   * @returns 结果
   */
  async getRoleUser(roleId: string, params: UserSearchParams): Promise<Record<string, any>> {
    return await HttpRequest.post(
      {
        url: RoleApi.getRoleUser,
        data: { roleId, searchParams: params },
      },
      {
        successMessageMode: 'none',
      },
    );
  },

  /**
   * 获取不在该角色下的所有可用用户
   * @param roleId 角色ID
   * @param params 用户查询参数和分页参数
   * @returns 结果
   */
  async getUserNotInRoleByPage(roleId: string, params: UserSearchParams): Promise<Record<string, any>> {
    return await HttpRequest.post(
      {
        url: RoleApi.getUserNotInRoleByPage,
        data: { roleId, searchParams: params },
      },
      {
        successMessageMode: 'none',
      },
    );
  },
  /**
   * 校验角色编码是否存在
   * @param roleCode 角色编码
   * @returns 结果
   */
  async checkRoleCodeExist(roleCode: string): Promise<boolean> {
    return await HttpRequest.get(
      {
        url: RoleApi.checkRoleCodeExist,
        params: { roleCode },
      },
      {
        successMessageMode: 'none',
      },
    );
  },
};
