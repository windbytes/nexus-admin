/**
 * @file 权限点 API 服务
 * @description 对接后端 `/system/permission/**`，供权限点树/按钮配置/角色授权等场景使用。
 */

import type { PermissionModel, PermissionSaveParams, PermissionSearchParams } from '@/shared/api/system/permission/type';
import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/shared/utils/request';

const PermissionApi = {
  queryPermissionListPage: '/system/permission/queryPermissionListPage',
  tree: '/system/permission/tree',
  add: '/system/permission/addPermission',
  update: '/system/permission/updatePermission',
  delete: '/system/permission/deletePermissions',
  enableBatch: '/system/permission/enableBatchPermission',
  disableBatch: '/system/permission/disableBatchPermission',
} as const;

/**
 * 权限点服务契约。
 */
interface IPermissionService {
  /**
   * 分页查询权限点。
   * @param searchParams - 含 permType（0 分组 / 1 按钮 / 2 接口）、menuId 时可筛选
   */
  queryPermissionListPage(searchParams: PermissionSearchParams): Promise<PageResult<PermissionModel>>;
  /**
   * 查询权限点树（分组/按钮/接口统一树）。
   * @param onlyEnabled - true 仅返回启用节点
   */
  getPermissionTree(onlyEnabled?: boolean): Promise<PermissionModel[]>;
  /** 新增权限点 */
  add(params: PermissionSaveParams): Promise<boolean>;
  /** 更新权限点 */
  update(params: PermissionSaveParams): Promise<boolean>;
  /** 批量删除权限点（逻辑删除，存在子节点或接口绑定时后端拒绝） */
  delete(ids: string[]): Promise<boolean>;
  /** 批量启用权限点 */
  enableBatch(ids: string[]): Promise<boolean>;
  /** 批量停用权限点 */
  disableBatch(ids: string[]): Promise<boolean>;
}

/**
 * 权限点服务实现。
 */
export const permissionService: IPermissionService = {
  queryPermissionListPage(searchParams) {
    return HttpRequest.post(
      {
        url: PermissionApi.queryPermissionListPage,
        data: searchParams,
      },
      { successMessageMode: 'none' }
    );
  },

  async getPermissionTree(onlyEnabled = false) {
    const data = await HttpRequest.get(
      {
        url: PermissionApi.tree,
        params: { onlyEnabled },
      },
      { successMessageMode: 'none' }
    );
    return Array.isArray(data) ? data : [];
  },

  add(params) {
    return HttpRequest.post({ url: PermissionApi.add, data: params }, { errorMessageMode: 'none' });
  },

  update(params) {
    return HttpRequest.post({ url: PermissionApi.update, data: params }, { errorMessageMode: 'none' });
  },

  delete(ids) {
    return HttpRequest.post(
      { url: PermissionApi.delete, data: { ids } },
      { errorMessageMode: 'none', successMessageMode: 'none' }
    );
  },

  enableBatch(ids) {
    return HttpRequest.post({ url: PermissionApi.enableBatch, data: { ids } }, { errorMessageMode: 'none' });
  },

  disableBatch(ids) {
    return HttpRequest.post({ url: PermissionApi.disableBatch, data: { ids } }, { errorMessageMode: 'none' });
  },
};
