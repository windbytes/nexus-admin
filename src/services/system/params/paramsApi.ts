import { HttpRequest } from '@/utils/request';
import type { PageResult } from '@/types/global';
import type { SysParam, SysParamSearchParams, SysParamFormData, ParamCategory, ExportOptions } from './type';

/**
 * 系统参数操作枚举
 */
const SysParamAction = {
  /**
   * 分页查询系统参数
   */
  queryParams: '/system/param/queryParamsList',

  /**
   * 根据ID查询系统参数
   */
  getParamById: '/system/param/getParamById',

  /**
   * 根据编码查询系统参数
   */
  getParamByCode: '/system/param/getParamByCode',

  /**
   * 新增系统参数
   */
  createParam: '/system/param/addParam',

  /**
   * 更新系统参数
   */
  updateParam: '/system/param/updateParam',

  /**
   * 删除系统参数
   */
  deleteParam: '/system/param/deleteParam',

  /**
   * 批量删除系统参数
   */
  batchDeleteParams: '/system/param/deleteBatchParams',

  /**
   * 获取参数分类列表
   */
  getCategories: '/system/param/getParamCategoryList',

  /**
   * 导入系统参数
   */
  importParams: '/system/param/importParams',

  /**
   * 导出系统参数
   */
  exportParams: '/system/param/exportParams',
};

/**
 * 系统参数服务接口
 */
export interface ISysParamService {
  /**
   * 分页查询系统参数
   * @param params 查询参数（包括分页）
   * @returns 系统参数列表、分页信息
   */
  queryParams(params: SysParamSearchParams): Promise<PageResult<SysParam>>;

  /**
   * 根据ID查询系统参数
   * @param id 参数ID
   * @returns 系统参数信息
   */
  getParamById(id: number): Promise<SysParam>;

  /**
   * 根据编码查询系统参数
   * @param code 参数编码
   * @returns 系统参数信息
   */
  getParamByCode(code: string): Promise<string>;

  /**
   * 新增系统参数
   * @param data 系统参数数据
   * @returns 创建结果
   */
  createParam(data: SysParamFormData): Promise<boolean>;

  /**
   * 更新系统参数
   * @param id 参数ID
   * @param data 系统参数数据
   * @returns 更新结果
   */
  updateParam(id: number, data: SysParamFormData): Promise<boolean>;

  /**
   * 删除系统参数
   * @param id 参数ID
   * @returns 删除结果
   */
  deleteParam(id: number): Promise<boolean>;

  /**
   * 批量删除系统参数
   * @param ids 参数ID列表
   * @returns 删除结果
   */
  batchDeleteParams(ids: number[]): Promise<boolean>;

  /**
   * 获取参数分类列表
   * @returns 参数分类列表
   */
  getCategories(): Promise<ParamCategory[]>;

  /**
   * 导入系统参数
   * @param file 导入文件
   * @returns 导入结果
   */
  importParams(file: File): Promise<boolean>;

  /**
   * 导出系统参数
   * @param options 导出选项
   * @returns 导出结果
   */
  exportParams(options: ExportOptions): Promise<Blob>;
}

/**
 * 系统参数服务实现
 */
export const sysParamService: ISysParamService = {
  /**
   * 分页查询系统参数
   * @param params 查询参数（包括分页）
   * @returns 系统参数列表、分页信息
   */
  async queryParams(params: SysParamSearchParams): Promise<PageResult<SysParam>> {
    const response = await HttpRequest.post<PageResult<SysParam>>(
      {
        url: SysParamAction.queryParams,
        data: params,
        adapter: 'fetch',
      },
      { successMessageMode: 'none' },
    );
    return response;
  },

  /**
   * 根据ID查询系统参数
   * @param id 参数ID
   * @returns 系统参数信息
   */
  async getParamById(id: number): Promise<SysParam> {
    const response = await HttpRequest.get<SysParam>(
      {
        url: `${SysParamAction.getParamById}/${id}`,
      },
      { successMessageMode: 'none' },
    );
    return response;
  },

  /**
   * 根据编码查询系统参数
   * @param code 参数编码
   * @returns 系统参数信息
   */
  async getParamByCode(code: string): Promise<string> {
    const response = await HttpRequest.get<string>(
      {
        url: `${SysParamAction.getParamByCode}/${code}`,
        adapter: 'fetch',
      },
      { successMessageMode: 'none' },
    );
    return response;
  },

  /**
   * 新增系统参数
   * @param data 系统参数数据
   * @returns 创建结果
   */
  async createParam(data: SysParamFormData): Promise<boolean> {
    const response = await HttpRequest.post<boolean>({
      url: SysParamAction.createParam,
      data,
    });
    return response;
  },

  /**
   * 更新系统参数
   * @param id 参数ID
   * @param data 系统参数数据
   * @returns 更新结果
   */
  async updateParam(id: number, data: SysParamFormData): Promise<boolean> {
    const response = await HttpRequest.put<boolean>({
      url: `${SysParamAction.updateParam}/${id}`,
      data,
    });
    return response;
  },

  /**
   * 删除系统参数
   * @param id 参数ID
   * @returns 删除结果
   */
  async deleteParam(id: number): Promise<boolean> {
    const response = await HttpRequest.delete<boolean>({
      url: `${SysParamAction.deleteParam}/${id}`,
    });
    return response;
  },

  /**
   * 批量删除系统参数
   * @param ids 参数ID列表
   * @returns 删除结果
   */
  async batchDeleteParams(ids: number[]): Promise<boolean> {
    const response = await HttpRequest.delete<boolean>({
      url: SysParamAction.batchDeleteParams,
      data: { ids },
    });
    return response;
  },

  /**
   * 获取参数分类列表
   * @returns 参数分类列表
   */
  async getCategories(): Promise<ParamCategory[]> {
    const response = await HttpRequest.get<ParamCategory[]>({
      url: SysParamAction.getCategories,
    });
    return response;
  },

  /**
   * 导入系统参数
   * @param file 导入文件
   * @returns 导入结果
   */
  async importParams(file: File): Promise<boolean> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await HttpRequest.post<boolean>({
      url: SysParamAction.importParams,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  /**
   * 导出系统参数
   * @param options 导出选项
   * @returns 导出结果
   */
  async exportParams(options: ExportOptions): Promise<Blob> {
    const { type, selectedIds, searchParams } = options;

    let params: any = {};

    if (type === 'selected' && selectedIds && selectedIds.length > 0) {
      // 导出选中的参数
      params = { ids: selectedIds };
    } else {
      // 导出全部或按搜索条件导出
      params = searchParams || {};
    }

    const response = await HttpRequest.get<Blob>(
      {
        url: SysParamAction.exportParams,
        params,
        responseType: 'blob',
      },
      { successMessageMode: 'none', errorMessageMode: 'none' },
    );
    return response;
  },
};
