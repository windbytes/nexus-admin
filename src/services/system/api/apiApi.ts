import { HttpRequest } from '@/utils/request';
import type { ApiModel, ApiSaveParams, QueryApisParams } from './type';

/**
 * 系统接口配置相关接口路径
 */
const ApiPaths = {
  /** 按菜单查询接口列表 */
  listByMenuId: '/system/api/listByMenuId',
  /** 新增接口 */
  add: '/system/api/add',
  /** 编辑接口 */
  update: '/system/api/update',
  /** 删除接口 */
  delete: '/system/api/delete',
  /** 批量删除接口 */
  batchDelete: '/system/api/batchDelete',
};

/**
 * 系统接口配置服务
 */
export interface IApiService {
  queryByMenuId(params: QueryApisParams): Promise<ApiModel[]>;
  add(params: ApiSaveParams): Promise<boolean>;
  update(params: ApiSaveParams): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  batchDelete(ids: string[]): Promise<boolean>;
}

export const apiService: IApiService = {
  async queryByMenuId(params: QueryApisParams): Promise<ApiModel[]> {
    const data = await HttpRequest.get<ApiModel[]>(
      {
        url: ApiPaths.listByMenuId,
        params: { menuId: params.menuId },
      },
      { successMessageMode: 'none' }
    );
    return Array.isArray(data) ? data : [];
  },

  add(params: ApiSaveParams): Promise<boolean> {
    return HttpRequest.post({ url: ApiPaths.add, data: params }, { errorMessageMode: 'none' });
  },

  update(params: ApiSaveParams): Promise<boolean> {
    return HttpRequest.post({ url: ApiPaths.update, data: params }, { errorMessageMode: 'none' });
  },

  delete(id: string): Promise<boolean> {
    return HttpRequest.delete(
      { url: ApiPaths.delete, params: { id } },
      { errorMessageMode: 'none', successMessageMode: 'none' }
    );
  },

  batchDelete(ids: string[]): Promise<boolean> {
    return HttpRequest.delete({
      url: ApiPaths.batchDelete,
      data: { ids },
    });
  },
};
