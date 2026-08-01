/**
 * @file 接口注册表 API 服务
 * @description 对接后端 `/system/api/**`，供接口管理页使用（注册项维护 + 注解扫描同步）。
 */

import type { ApiModel, ApiSaveParams, ApiScanResult, ApiSearchParams } from '@/shared/api/system/api/type';
import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/shared/utils/request';

/** 后端接口路径 */
const ApiPaths = {
  page: '/system/api/page',
  add: '/system/api/add',
  update: '/system/api/update',
  delete: '/system/api/delete',
  batchDelete: '/system/api/batchDelete',
  scan: '/system/api/scan',
} as const;

/**
 * 接口注册表服务契约。
 */
interface IApiService {
  /** 分页查询接口注册表 */
  page(params: ApiSearchParams): Promise<PageResult<ApiModel>>;
  /** 新增接口注册项（手工登记） */
  add(params: ApiSaveParams): Promise<boolean>;
  /** 更新接口注册项 */
  update(params: ApiSaveParams): Promise<boolean>;
  /** 删除单条注册项 */
  delete(id: string): Promise<boolean>;
  /** 批量删除注册项 */
  batchDelete(ids: string[]): Promise<boolean>;
  /** 注解扫描同步（@PreAuthorize 端点 → 注册表） */
  scan(): Promise<ApiScanResult>;
}

/**
 * 接口注册表服务实现。
 */
export const apiService: IApiService = {
  page(params) {
    return HttpRequest.post({ url: ApiPaths.page, data: params }, { successMessageMode: 'none' });
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

  scan() {
    return HttpRequest.post({ url: ApiPaths.scan }, { successMessageMode: 'none' });
  },
};
