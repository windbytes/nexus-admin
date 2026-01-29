import { HttpRequest } from '@/utils/request';
import type { PageButtonModel, PageButtonSaveParams, QueryPageButtonsParams } from './type';

/**
 * 页面按钮配置相关接口枚举
 */
const PageButtonApi = {
  /** 按菜单查询页面按钮列表 */
  queryByMenuId: '/system/pageButton/listByMenuId',
  /** 新增页面按钮 */
  add: '/system/pageButton/add',
  /** 编辑页面按钮 */
  update: '/system/pageButton/update',
  /** 删除页面按钮 */
  delete: '/system/pageButton/delete',
  /** 批量删除页面按钮 */
  batchDelete: '/system/pageButton/batchDelete',
  /** 切换按钮状态 */
  toggleStatus: '/system/pageButton/toggleStatus',
};

/**
 * 页面按钮配置服务接口
 */
export interface IPageButtonService {
  /** 按菜单 ID 查询页面按钮列表（支持按 sort 排序） */
  queryByMenuId(params: QueryPageButtonsParams): Promise<PageButtonModel[]>;
  /** 新增页面按钮 */
  add(params: PageButtonSaveParams): Promise<boolean>;
  /** 编辑页面按钮 */
  update(params: PageButtonSaveParams): Promise<boolean>;
  /** 删除页面按钮 */
  delete(id: string): Promise<boolean>;
  /** 批量删除页面按钮 */
  batchDelete(ids: string[]): Promise<boolean>;
  /** 切换按钮状态 */
  toggleStatus(id: string, status: boolean): Promise<boolean>;
}

/**
 * 页面按钮配置服务实现
 */
export const pageButtonService: IPageButtonService = {
  async queryByMenuId(params: QueryPageButtonsParams): Promise<PageButtonModel[]> {
    const data = await HttpRequest.get<PageButtonModel[]>(
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

  add(params: PageButtonSaveParams): Promise<boolean> {
    return HttpRequest.post(
      {
        url: PageButtonApi.add,
        data: params,
      },
      { errorMessageMode: 'none' }
    );
  },

  update(params: PageButtonSaveParams): Promise<boolean> {
    return HttpRequest.post(
      {
        url: PageButtonApi.update,
        data: params,
      },
      { errorMessageMode: 'none' }
    );
  },

  delete(id: string): Promise<boolean> {
    return HttpRequest.delete(
      {
        url: PageButtonApi.delete,
        params: { id },
      },
      { errorMessageMode: 'none', successMessageMode: 'none' }
    );
  },

  batchDelete(ids: string[]): Promise<boolean> {
    return HttpRequest.delete({
      url: PageButtonApi.batchDelete,
      data: { ids },
    });
  },

  toggleStatus(id: string, status: boolean): Promise<boolean> {
    return HttpRequest.post({
      url: PageButtonApi.toggleStatus,
      data: { id, status },
    });
  },
};
