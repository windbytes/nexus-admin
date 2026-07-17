/**
 * @file 权限点 API 服务
 * @description 对接后端 `/system/permission/**`，供角色授权等场景使用。
 */

import type { PermissionModel, PermissionSearchParams } from '@/shared/api/system/permission/type';
import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/shared/utils/request';

const PermissionApi = {
  queryPermissionListPage: '/system/permission/queryPermissionListPage',
} as const;

/**
 * 权限点服务契约（角色授权所需最小集）。
 */
interface IPermissionService {
  /**
   * 分页查询权限点。
   * @param searchParams - 含 resourceType 时可按类型筛选（1 按钮 / 2 接口）
   */
  queryPermissionListPage(searchParams: PermissionSearchParams): Promise<PageResult<PermissionModel>>;
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
};
