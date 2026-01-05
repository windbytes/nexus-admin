import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type { UserModel, UserSearchParams } from './type';

/**
 * 用户信息操作枚举
 */
const UserAction = {
  /**
   * 创建用户
   */
  addUser: '/system/user/addUser',

  /**
   * 批量删除用户（物理删除）
   */
  deleteUsers: '/system/user/deleteUsers',

  /**
   * 批量删除用户（逻辑删除）
   */
  logicDeleteUsers: '/system/user/logicDeleteUsers',

  /**
   * 更新用户
   */
  modifyUser: '/system/user/updateUser',

  /**
   * 查询用户列表（分页）
   */
  queryUserListPage: '/system/user/queryUserListPage',

  /**
   * 分页查询回收站用户列表
   */
  queryRecycleUserListPage: '/system/user/queryRecycleUserListPage',

  /**
   * 批量锁定用户
   */
  lockBatchUser: '/system/user/lockBatchUser',

  /**
   * 批量解锁用户
   */
  unlockBatchUser: '/system/user/unlockBatchUser',

  /**
   * 重置用户密码
   */
  resetUserPwd: '/system/user/resetPwd',

  /**
   * 修改用户密码
   */
  changeUserPwd: '/system/user/modifyPwd',

  /**
   * 分配角色
   */
  assignRole: '/system/user/assignRole',

  /**
   * 批量恢复用户（从回收站恢复）
   */
  restoreUsers: '/system/user/recoverFromRecycle',
};

/**
 * 用户信息服务接口
 */
export interface IUserService {
  /**
   * 创建用户
   * @param user 用户信息
   * @returns 创建结果
   */
  createUser(user: Partial<UserModel>): Promise<boolean>;

  /**
   * 批量删除用户（物理删除）
   * @param ids 用户ID列表
   * @returns 删除结果
   */
  deleteUsers(ids: string[]): Promise<boolean>;

  /**
   * 批量删除用户（逻辑删除）
   * @param ids 用户ID列表
   * @returns 删除结果
   */
  logicDeleteUsers(ids: string[]): Promise<boolean>;

  /**
   * 更新用户
   * @param user 用户信息
   * @returns 更新结果
   */
  updateUser(user: Partial<UserModel>): Promise<boolean>;

  /**
   * 查询用户列表（分页）
   * @param searchParams 查询参数（包括分页）
   * @returns 用户列表、分页信息
   */
  queryUserListPage(searchParams: UserSearchParams): Promise<PageResult<UserModel>>;

  /**
   * 分页查询回收站用户列表
   * @param searchParams 查询参数（包括分页）
   * @returns 用户列表、分页信息
   */
  queryRecycleUserListPage(searchParams: UserSearchParams): Promise<PageResult<UserModel>>;

  /**
   * 批量更新用户状态
   * @param ids 用户ID列表
   * @param status 用户状态
   * @returns 更新结果
   */
  updateBatchUserStatus(id: string[], status: number): Promise<boolean>;

  /**
   * 重置用户密码
   * @param id 用户ID
   * @returns 重置结果
   */
  resetUserPwd(id: string): Promise<boolean>;

  /**
   * 修改用户密码
   * @param id 用户ID
   * @param newPassword 新密码
   * @returns 修改结果
   */
  changeUserPwd(id: string, newPassword: string): Promise<boolean>;

  /**
   * 分配角色
   * @param userId 用户ID
   * @param roleIds 角色ID列表
   * @returns 分配结果
   */
  assignRole(userId: string, roleIds: string[]): Promise<boolean>;

  /**
   * 批量恢复用户（从回收站恢复）
   * @param ids 用户ID列表
   * @returns 恢复结果
   */
  restoreUsers(ids: string[]): Promise<boolean>;
}

/**
 * 用户信息服务实现
 */
export const userService: IUserService = {
  /**
   * 创建用户
   * @param user 用户信息
   * @returns 创建结果
   */
  async createUser(user: UserModel): Promise<boolean> {
    const response = await HttpRequest.post({
      url: UserAction.addUser,
      params: user,
    });
    return response;
  },
  /**
   * 删除用户
   * @param ids 用户ID列表
   * @returns 删除结果
   */
  async deleteUsers(ids: string[]): Promise<boolean> {
    const response = await HttpRequest.post({
      url: UserAction.deleteUsers,
      data: ids,
    });
    return response;
  },

  /**
   * 批量删除用户
   * @param ids 用户ID列表
   * @returns 删除结果
   */
  async logicDeleteUsers(ids: string[]): Promise<boolean> {
    const response = await HttpRequest.post({
      url: UserAction.logicDeleteUsers,
      data: ids,
    });
    return response;
  },

  /**
   * 更新用户
   * @param user 用户信息
   * @returns 更新结果
   */
  async updateUser(user: UserModel): Promise<boolean> {
    const response = await HttpRequest.post({
      url: UserAction.modifyUser,
      data: user,
    });
    return response;
  },

  /**
   * 查询用户列表（分页）
   * @param searchParams 查询参数（包括分页）
   * @returns 用户列表、分页信息
   */
  async queryUserListPage(searchParams: UserSearchParams): Promise<PageResult<UserModel>> {
    const response = await HttpRequest.post(
      {
        url: UserAction.queryUserListPage,
        data: searchParams,
      },
      {
        successMessageMode: 'none',
      }
    );
    return response;
  },

  /**
   * 分页查询回收站用户列表
   * @param searchParams 查询参数（包括分页）
   * @returns 用户列表、分页信息
   */
  async queryRecycleUserListPage(searchParams: UserSearchParams): Promise<PageResult<UserModel>> {
    const response = await HttpRequest.post(
      {
        url: UserAction.queryRecycleUserListPage,
        data: searchParams,
      },
      {
        successMessageMode: 'none',
      }
    );
    return response;
  },

  /* 批量更新用户状态
   * @param ids 用户ID列表
   * @param status 用户状态
   * @returns 更新结果
   */
  async updateBatchUserStatus(ids: string[], status: number): Promise<boolean> {
    // 根据status决定是锁定还是解锁用户
    const url = status === 0 ? UserAction.lockBatchUser : UserAction.unlockBatchUser;
    return HttpRequest.post(
      {
        url,
        data: ids,
      },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 重置用户密码
   * @param id 用户ID
   * @returns 重置结果
   */
  async resetUserPwd(id: string): Promise<boolean> {
    const response = await HttpRequest.post({
      url: UserAction.resetUserPwd,
      data: id,
    });
    return response;
  },

  /**
   * 修改用户密码
   * @param id 用户ID
   * @param newPassword 新密码
   * @returns 修改结果
   */
  async changeUserPwd(id: string, newPassword: string): Promise<boolean> {
    const response = await HttpRequest.post({
      url: UserAction.changeUserPwd,
      data: { id, password: newPassword },
    });
    return response;
  },

  /**
   * 分配角色
   * @param userId 用户ID
   * @param roleIds 角色ID列表
   * @returns 分配结果
   */
  async assignRole(userId: string, roleIds: string[]): Promise<boolean> {
    const response = await HttpRequest.post({
      url: UserAction.assignRole,
      data: { userId, roleIds },
    });
    return response;
  },

  /**
   * 批量恢复用户（从回收站恢复）
   * @param ids 用户ID列表
   * @returns 恢复结果
   */
  async restoreUsers(ids: string[]): Promise<boolean> {
    const response = await HttpRequest.post({
      url: UserAction.restoreUsers,
      data: ids,
    });
    return response;
  },
};
