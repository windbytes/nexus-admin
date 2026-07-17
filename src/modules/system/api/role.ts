/**
 * @file 角色管理 API 服务
 * @description 对接后端 `/system/role/**`，供角色维护与授权抽屉使用。
 */

import type { RoleMenu, RoleModel, RoleSearchParams } from '@/shared/api/system/role/type';
import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/shared/utils/request';

const RoleApi = {
  getRoleListPage: '/system/role/getRoleListPage',
  addRole: '/system/role/addRole',
  editRole: '/system/role/editRole',
  changeStatus: '/system/role/changeStatus',
  logicDeleteBatchRoles: '/system/role/logicDeleteBatchRoles',
  getRoleMenu: '/system/role/getRoleMenu',
  assignRoleMenu: '/system/role/assignRoleMenu',
  assignRolePermission: '/system/role/assignRolePermission',
  getRoleButtonPermissionIds: '/system/role/getRoleButtonPermissionIds',
  getRoleApiPermissionIds: '/system/role/getRoleApiPermissionIds',
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
  /** 查询角色菜单授权数据 */
  getRoleMenu(roleId: string): Promise<RoleMenu>;
  /** 分配角色菜单 */
  assignRoleMenu(roleId: string, menuIds: string[]): Promise<boolean>;
  /** 全量覆盖分配角色权限点 */
  assignRolePermission(roleId: string, permissionIds: string[]): Promise<boolean>;
  /** 查询角色已配置的按钮权限点 ID（resourceType=1） */
  getRoleButtonPermissionIds(roleId: string): Promise<string[]>;
  /** 查询角色已配置的接口权限点 ID（resourceType=2） */
  getRoleApiPermissionIds(roleId: string): Promise<string[]>;
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

  getRoleMenu(roleId) {
    return HttpRequest.get(
      { url: RoleApi.getRoleMenu, params: { roleId } },
      { successMessageMode: 'none' }
    );
  },

  assignRoleMenu(roleId, menuIds) {
    return HttpRequest.post({
      url: RoleApi.assignRoleMenu,
      data: { roleId, menuIds },
    });
  },

  assignRolePermission(roleId, permissionIds) {
    return HttpRequest.post({
      url: RoleApi.assignRolePermission,
      data: { roleId, permissionIds },
    });
  },

  getRoleButtonPermissionIds(roleId) {
    return HttpRequest.get(
      { url: RoleApi.getRoleButtonPermissionIds, params: { roleId } },
      { successMessageMode: 'none' }
    );
  },

  getRoleApiPermissionIds(roleId) {
    return HttpRequest.get(
      { url: RoleApi.getRoleApiPermissionIds, params: { roleId } },
      { successMessageMode: 'none' }
    );
  },

  checkRoleCodeExist(roleCode) {
    return HttpRequest.get(
      { url: RoleApi.checkRoleCodeExist, params: { roleCode } },
      { successMessageMode: 'none' }
    );
  },
};
