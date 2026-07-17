/**
 * @file 页面按钮 API 服务
 * @description 对接后端 `/system/pageButton/**`，供按钮管理页使用。
 */

import type {
  PageButtonModel,
  PageButtonSaveParams,
  QueryPageButtonsParams,
} from '@/shared/api/system/pageButton/type';
import { HttpRequest } from '@/shared/utils/request';

/** 后端页面按钮接口路径 */
const PageButtonApi = {
  queryByMenuId: '/system/pageButton/listByMenuId',
  add: '/system/pageButton/add',
  update: '/system/pageButton/update',
  delete: '/system/pageButton/delete',
  batchDelete: '/system/pageButton/batchDelete',
  toggleStatus: '/system/pageButton/toggleStatus',
} as const;

/**
 * 页面按钮配置服务契约。
 */
interface IPageButtonService {
  /**
   * 按菜单 ID 查询页面按钮列表。
   * @param params - menuId 必填，可选 code/name/permCode 筛选
   */
  queryByMenuId(params: QueryPageButtonsParams): Promise<PageButtonModel[]>;
  /** 新增页面按钮 */
  add(params: PageButtonSaveParams): Promise<boolean>;
  /** 编辑页面按钮 */
  update(params: PageButtonSaveParams): Promise<boolean>;
  /** 删除单条页面按钮 */
  delete(id: string): Promise<boolean>;
  /** 批量删除页面按钮（请求体为 ID 数组） */
  batchDelete(ids: string[]): Promise<boolean>;
  /** 切换启用/停用状态 */
  toggleStatus(id: string, status: boolean): Promise<boolean>;
}

/**
 * 页面按钮配置服务实现。
 */
export const pageButtonService: IPageButtonService = {
  async queryByMenuId(params) {
    const data = await HttpRequest.get(
      {
        url: PageButtonApi.queryByMenuId,
        params: {
          menuId: params.menuId,
          code: params.code,
          name: params.name,
          permCode: params.permCode,
        },
      },
      { successMessageMode: 'none' }
    );
    return Array.isArray(data) ? data : [];
  },

  add(params) {
    return HttpRequest.post({ url: PageButtonApi.add, data: params }, { errorMessageMode: 'none' });
  },

  update(params) {
    return HttpRequest.post({ url: PageButtonApi.update, data: params }, { errorMessageMode: 'none' });
  },

  delete(id) {
    return HttpRequest.delete(
      { url: PageButtonApi.delete, params: { id } },
      { errorMessageMode: 'none', successMessageMode: 'none' }
    );
  },

  batchDelete(ids) {
    return HttpRequest.delete({
      url: PageButtonApi.batchDelete,
      data: ids.map(Number),
    });
  },

  toggleStatus(id, status) {
    return HttpRequest.post({
      url: PageButtonApi.toggleStatus,
      data: { id, status },
    });
  },
};
