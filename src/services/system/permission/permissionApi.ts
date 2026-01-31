import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type { PermissionModel, PermissionSearchParams } from './type';

/**
 * 权限点操作枚举
 */
const PermissionAction = {
  /**
   * 创建权限点
   */
  addPermission: '/system/permission/addPermission',

  /**
   * 批量删除权限点
   */
  deletePermissions: '/system/permission/deletePermissions',

  /**
   * 更新权限点
   */
  updatePermission: '/system/permission/updatePermission',

  /**
   * 查询权限点列表（分页）
   */
  queryPermissionListPage: '/system/permission/queryPermissionListPage',

  /**
   * 批量启用权限点
   */
  enableBatchPermission: '/system/permission/enableBatchPermission',

  /**
   * 批量停用权限点
   */
  disableBatchPermission: '/system/permission/disableBatchPermission',

  /**
   * 导出权限点数据
   */
  exportPermissions: '/system/permission/exportPermissions',

  /**
   * 导入权限点数据
   */
  importPermissions: '/system/permission/importPermissions',

  /**
   * 下载导入模板
   */
  downloadTemplate: '/system/permission/downloadTemplate',
};

/**
 * 权限点服务接口
 */
export interface IPermissionService {
  /**
   * 创建权限点
   * @param permission 权限点信息
   * @returns 创建结果
   */
  createPermission(permission: Partial<PermissionModel>): Promise<boolean>;

  /**
   * 批量删除权限点
   * @param ids 权限点ID列表
   * @returns 删除结果
   */
  deletePermissions(ids: string[]): Promise<boolean>;

  /**
   * 更新权限点
   * @param permission 权限点信息
   * @returns 更新结果
   */
  updatePermission(permission: Partial<PermissionModel>): Promise<boolean>;

  /**
   * 查询权限点列表（分页）
   * @param searchParams 查询参数（包括分页）
   * @returns 权限点列表、分页信息
   */
  queryPermissionListPage(searchParams: PermissionSearchParams): Promise<PageResult<PermissionModel>>;

  /**
   * 批量更新权限点状态
   * @param ids 权限点ID列表
   * @param status 权限点状态
   * @returns 更新结果
   */
  updateBatchStatus(ids: string[], status: boolean): Promise<boolean>;

  /**
   * 导出权限点数据
   * @param searchParams 查询参数
   * @returns 导出结果
   */
  exportPermissions(searchParams?: PermissionSearchParams): Promise<boolean>;

  /**
   * 导入权限点数据
   * @param file 文件
   * @returns 导入结果
   */
  importPermissions(file: File): Promise<{ success: number; fail: number }>;

  /**
   * 下载导入模板
   * @returns 下载结果
   */
  downloadTemplate(): Promise<boolean>;
}

/**
 * 权限点服务实现
 */
export const permissionService: IPermissionService = {
  /**
   * 创建权限点
   * @param permission 权限点信息
   * @returns 创建结果
   */
  async createPermission(permission: Partial<PermissionModel>): Promise<boolean> {
    const response = await HttpRequest.post(
      {
        url: PermissionAction.addPermission,
        params: permission,
      },
      { errorMessageMode: 'none' }
    );
    return response;
  },

  /**
   * 批量删除权限点
   * @param ids 权限点ID列表
   * @returns 删除结果
   */
  async deletePermissions(ids: string[]): Promise<boolean> {
    const response = await HttpRequest.post({
      url: PermissionAction.deletePermissions,
      data: ids,
    });
    return response;
  },

  /**
   * 更新权限点
   * @param permission 权限点信息
   * @returns 更新结果
   */
  async updatePermission(permission: Partial<PermissionModel>): Promise<boolean> {
    const response = await HttpRequest.post({
      url: PermissionAction.updatePermission,
      data: permission,
    });
    return response;
  },

  /**
   * 查询权限点列表（分页）
   * @param searchParams 查询参数（包括分页）
   * @returns 权限点列表、分页信息
   */
  async queryPermissionListPage(searchParams: PermissionSearchParams): Promise<PageResult<PermissionModel>> {
    const response = await HttpRequest.post(
      {
        url: PermissionAction.queryPermissionListPage,
        data: searchParams,
      },
      {
        successMessageMode: 'none',
      }
    );
    return response;
  },

  /**
   * 批量更新权限点状态
   * @param ids 权限点ID列表
   * @param status 权限点状态
   * @returns 更新结果
   */
  async updateBatchStatus(ids: string[], status: boolean): Promise<boolean> {
    // 根据status决定是启用还是停用权限点
    const url = status ? PermissionAction.enableBatchPermission : PermissionAction.disableBatchPermission;
    return HttpRequest.post(
      {
        url,
        data: ids,
      },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 导出权限点数据
   * @param searchParams 查询参数
   * @returns 导出结果
   */
  async exportPermissions(searchParams?: PermissionSearchParams): Promise<boolean> {
    const response = await HttpRequest.post({
      url: PermissionAction.exportPermissions,
      data: searchParams,
    });
    return response;
  },

  /**
   * 导入权限点数据
   * @param file 文件
   * @returns 导入结果
   */
  async importPermissions(file: File): Promise<{ success: number; fail: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await HttpRequest.post({
      url: PermissionAction.importPermissions,
      data: formData,
    });
    return response;
  },

  /**
   * 下载导入模板
   * @returns 下载结果
   */
  async downloadTemplate(): Promise<boolean> {
    const response = await HttpRequest.post({
      url: PermissionAction.downloadTemplate,
    });
    return response;
  },
};
