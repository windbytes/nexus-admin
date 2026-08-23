/**
 * @file 系统管理 - 用户 API 服务
 * @description 对接后端 `/system/user/**`，供用户维护与回收站使用。
 */

import type { UserModel, UserSearchParams } from '@/shared/api/system/user/type';
import { HttpRequest } from '@/shared/utils/request';
import type { PageResult } from '@/types/global';

/**
 * 用户相关接口枚举
 */
const UserApi = {
  /** 创建用户 */
  addUser: '/system/user/addUser',
  /** 批量删除用户（物理删除） */
  deleteUsers: '/system/user/deleteUsers',
  /** 批量删除用户（逻辑删除） */
  logicDeleteUsers: '/system/user/logicDeleteUsers',
  /** 更新用户 */
  updateUser: '/system/user/updateUser',
  /** 分页查询用户列表 */
  queryUserListPage: '/system/user/queryUserListPage',
  /** 分页查询回收站用户列表 */
  queryRecycleUserListPage: '/system/user/queryRecycleUserListPage',
  /** 批量锁定用户 */
  lockBatchUser: '/system/user/lockBatchUser',
  /** 批量解锁用户 */
  unlockBatchUser: '/system/user/unlockBatchUser',
  /** 重置用户密码 */
  resetUserPwd: '/system/user/resetPwd',
  /** 修改用户密码 */
  changeUserPwd: '/system/user/modifyPwd',
  /** 分配角色 */
  assignRole: '/system/user/assignRole',
  /** 从回收站批量恢复用户 */
  restoreUsers: '/system/user/recoverFromRecycle',
} as const;

/**
 * 用户信息服务契约
 */
interface IUserService {
  /** 创建用户 */
  createUser(user: Partial<UserModel>): Promise<boolean>;
  /** 批量删除用户（物理删除） */
  deleteUsers(ids: string[]): Promise<boolean>;
  /** 批量删除用户（逻辑删除） */
  logicDeleteUsers(ids: string[]): Promise<boolean>;
  /** 更新用户 */
  updateUser(user: Partial<UserModel>): Promise<boolean>;
  /** 分页查询用户列表 */
  queryUserListPage(searchParams: UserSearchParams): Promise<PageResult<UserModel>>;
  /** 分页查询回收站用户列表 */
  queryRecycleUserListPage(searchParams: UserSearchParams): Promise<PageResult<UserModel>>;
  /** 批量更新用户状态（0 锁定 / 1 解锁） */
  updateBatchUserStatus(ids: string[], status: number): Promise<boolean>;
  /** 重置用户密码 */
  resetUserPwd(id: string): Promise<boolean>;
  /** 修改用户密码 */
  changeUserPwd(id: string, newPassword: string): Promise<boolean>;
  /** 分配角色 */
  assignRole(userId: string, roleIds: string[]): Promise<boolean>;
  /** 从回收站批量恢复用户 */
  restoreUsers(ids: string[]): Promise<boolean>;
}

/**
 * 用户信息服务实现
 */
export const userService: IUserService = {
  createUser(user) {
    return HttpRequest.post({ url: UserApi.addUser, params: user });
  },

  deleteUsers(ids) {
    return HttpRequest.post({ url: UserApi.deleteUsers, data: ids });
  },

  logicDeleteUsers(ids) {
    return HttpRequest.post({ url: UserApi.logicDeleteUsers, data: ids });
  },

  updateUser(user) {
    return HttpRequest.post({ url: UserApi.updateUser, data: user });
  },

  queryUserListPage(searchParams) {
    return HttpRequest.post({ url: UserApi.queryUserListPage, data: searchParams }, { successMessageMode: 'none' });
  },

  queryRecycleUserListPage(searchParams) {
    return HttpRequest.post(
      { url: UserApi.queryRecycleUserListPage, data: searchParams },
      { successMessageMode: 'none' }
    );
  },

  updateBatchUserStatus(ids, status) {
    const url = status === 0 ? UserApi.lockBatchUser : UserApi.unlockBatchUser;
    return HttpRequest.post({ url, data: ids }, { successMessageMode: 'none' });
  },

  resetUserPwd(id) {
    return HttpRequest.post({ url: UserApi.resetUserPwd, data: id });
  },

  changeUserPwd(id, newPassword) {
    return HttpRequest.post({ url: UserApi.changeUserPwd, data: { id, password: newPassword } });
  },

  assignRole(userId, roleIds) {
    return HttpRequest.post({ url: UserApi.assignRole, data: { userId, roleIds } });
  },

  restoreUsers(ids) {
    return HttpRequest.post({ url: UserApi.restoreUsers, data: ids }, { successMessageMode: 'none' });
  },
};
