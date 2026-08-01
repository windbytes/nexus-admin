/**
 * @file 角色管理 API 服务
 * @description 对接后端 `/system/role/**`，供角色维护与统一授权抽屉使用。
 */

import type { RoleGrantTreeResponse, RoleModel, RoleSearchParams } from '@/shared/api/system/role/type';
import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/shared/utils/request';

const RoleApi = {
  getRoleListPage: '/system/role/getRoleListPage',
  addRole: '/system/role/addRole',
  editRole: '/system/role/editRole',
  changeStatus: '/system/role/changeStatus',
  logicDeleteBatchRoles: '/system/role/logicDeleteBatchRoles',
  grantTree: '/system/role/grantTree',
  grants: '/system/role/grants',
  checkRoleCodeExist: '/system/role/checkRoleCodeExist',
} as const;

/**
 * 角色管理服务契约。
 */
interface IRoleService {
  /** 分页查询角色 */
  getRoleListPage(params: RoleSearchParams): Promise<PageResult<RoleModel>>;
  /** 新增角色 */
  addRole(params: Partial<RoleModel>): Promise<boolean>;
  /** 编辑角色 */
  editRole(params: Partial<RoleModel>): Promise<boolean>;
  /** 切换角色状态 */
  changeStatus(params: Partial<RoleModel>): Promise<boolean>;
  /** 逻辑批量删除角色 */
  logicDeleteBatchRole(ids: string[]): Promise<boolean>;
  /**
   * 查询角色统一授权树（菜单/按钮/接口合并树 + 已勾选 keys）。
   * @param roleId - 角色主键 ID
   */
  getGrantTree(roleId: string): Promise<RoleGrantTreeResponse>;
  /**
   * 保存角色统一授权（全量覆盖角色菜单与权限点）。
   * @param roleId - 角色主键 ID
   * @param checkedKeys - 勾选节点 keys（menu:{id} / perm:{id}）
   */
  saveGrants(roleId: string, checkedKeys: string[]): Promise<boolean>;
  /** 校验角色编码是否存在 */
  checkRoleCodeExist(roleCode: string): Promise<boolean>;
}

/**
 * 角色管理服务实现。
 */
export const roleService: IRoleService = {
  getRoleListPage(params) {
    return HttpRequest.post({ url: RoleApi.getRoleListPage, data: params }, { successMessageMode: 'none' });
  },

  addRole(params) {
    return HttpRequest.post({ url: RoleApi.addRole, data: params });
  },

  editRole(params) {
    return HttpRequest.post({ url: RoleApi.editRole, data: params });
  },

  changeStatus(params) {
    return HttpRequest.post({ url: RoleApi.changeStatus, data: params });
  },

  logicDeleteBatchRole(ids) {
    return HttpRequest.delete({
      url: RoleApi.logicDeleteBatchRoles,
      data: ids.map(Number),
    });
  },

  getGrantTree(roleId) {
    return HttpRequest.get(
      { url: RoleApi.grantTree, params: { roleId } },
      { successMessageMode: 'none' }
    );
  },

  saveGrants(roleId, checkedKeys) {
    return HttpRequest.put({
      url: RoleApi.grants,
      data: { roleId, checkedKeys },
    });
  },

  checkRoleCodeExist(roleCode) {
    return HttpRequest.get(
      { url: RoleApi.checkRoleCodeExist, params: { roleCode } },
      { successMessageMode: 'none' }
    );
  },
};
