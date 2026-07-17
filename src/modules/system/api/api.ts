/**
 * @file 系统接口（菜单下 API）服务
 * @description 对接后端 `/system/api/**`，供接口管理页使用。
 */

import type { ApiModel, ApiSaveParams, QueryApisParams } from '@/shared/api/system/api/type';
import { HttpRequest } from '@/shared/utils/request';

/** 后端接口路径 */
const ApiPaths = {
  listByMenuId: '/system/api/listByMenuId',
  add: '/system/api/add',
  update: '/system/api/update',
  delete: '/system/api/delete',
  batchDelete: '/system/api/batchDelete',
} as const;

/**
 * 系统接口配置服务契约。
 */
interface IApiService {
  /** 按菜单 ID 查询接口列表 */
  queryByMenuId(params: QueryApisParams): Promise<ApiModel[]>;
  /** 新增接口 */
  add(params: ApiSaveParams): Promise<boolean>;
  /** 更新接口 */
  update(params: ApiSaveParams): Promise<boolean>;
  /** 删除单条接口 */
  delete(id: string): Promise<boolean>;
  /** 批量删除接口 */
  batchDelete(ids: string[]): Promise<boolean>;
}

/**
 * 系统接口配置服务实现。
 */
export const apiService: IApiService = {
  async queryByMenuId(params) {
    const data = await HttpRequest.get(
      {
        url: ApiPaths.listByMenuId,
        params: { menuId: params.menuId },
      },
      { successMessageMode: 'none' }
    );
    return Array.isArray(data) ? data : [];
  },

  add(params) {
    return HttpRequest.post({ url: ApiPaths.add, data: params }, { errorMessageMode: 'none' });
  },

  update(params) {
    return HttpRequest.post({ url: ApiPaths.update, data: params }, { errorMessageMode: 'none' });
  },

  delete(id) {
    return HttpRequest.delete(
      { url: ApiPaths.delete, params: { id } },
      { errorMessageMode: 'none', successMessageMode: 'none' }
    );
  },

  batchDelete(ids) {
    return HttpRequest.delete({
      url: ApiPaths.batchDelete,
      data: { ids: ids.map(Number) },
    });
  },
};
