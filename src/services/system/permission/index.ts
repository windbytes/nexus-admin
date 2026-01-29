import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type { InterfacePermission } from '../menu/menuApi';
import type { MenuModel } from '../menu/type';
import type { PermissionModel, PermissionResourceModel, PermissionSearchParams, SavePermissionRequest } from './type';

/**
 * 权限点操作枚举
 */
const PermissionAction = {
  /**
   * 保存权限点（统一接口，包含基础信息和资源绑定）
   */
  savePermission: '/system/permission/savePermission',

  /**
   * 删除权限点
   */
  deletePermission: '/system/permission/deletePermission',

  /**
   * 批量删除权限点
   */
  deletePermissions: '/system/permission/deletePermissions',

  /**
   * 查询权限点列表（分页）
   */
  queryPermissionListPage: '/system/permission/queryPermissionListPage',

  /**
   * 更新权限点状态
   */
  updatePermissionStatus: '/system/permission/updatePermissionStatus',

  /**
   * 批量导入权限点
   */
  importPermissions: '/system/permission/importPermissions',

  /**
   * 批量导出权限点
   */
  exportPermissions: '/system/permission/exportPermissions',

  /**
   * 绑定权限资源
   */
  bindPermissionResources: '/system/permission/bindPermissionResources',

  /**
   * 查询权限已绑定的资源
   */
  queryPermissionResources: '/system/permission/queryPermissionResources',

  /**
   * 查询菜单按钮资源（用于资源绑定选择）
   */
  queryMenuButtonResources: '/system/permission/queryMenuButtonResources',

  /**
   * 查询菜单接口资源（用于资源绑定选择）
   */
  queryMenuInterfaceResources: '/system/permission/queryMenuInterfaceResources',
};

/**
 * 权限点服务接口
 */
export interface IPermissionService {
  /**
   * 删除权限点
   * @param id 权限点ID
   * @returns 删除结果
   */
  deletePermission(id: string): Promise<boolean>;

  /**
   * 批量删除权限点
   * @param ids 权限点ID列表
   * @returns 删除结果
   */
  deletePermissions(ids: string[]): Promise<boolean>;

  /**
   * 查询权限点列表（分页）
   * @param searchParams 查询参数（包括分页）
   * @returns 权限点列表、分页信息
   */
  queryPermissionListPage(searchParams: PermissionSearchParams): Promise<PageResult<PermissionModel>>;

  /**
   * 更新权限点状态
   * @param id 权限点ID
   * @param status 状态 1-启用 0-停用
   * @returns 更新结果
   */
  updatePermissionStatus(id: string, status: number): Promise<boolean>;

  /**
   * 批量导入权限点
   * @param file 文件
   * @returns 导入结果
   */
  importPermissions(file: File): Promise<boolean>;

  /**
   * 批量导出权限点
   * @param searchParams 查询参数
   * @returns 导出文件
   */
  exportPermissions(searchParams: PermissionSearchParams): Promise<Blob>;

  /**
   * 绑定权限资源
   * @param permissionId 权限点ID
   * @param resources 资源列表
   * @returns 绑定结果
   */
  bindPermissionResources(permissionId: string, resources: PermissionResourceModel[]): Promise<boolean>;

  /**
   * 查询权限已绑定的资源
   * @param permissionId 权限点ID
   * @returns 资源列表
   */
  queryPermissionResources(permissionId: string): Promise<PermissionResourceModel[]>;

  /**
   * 查询菜单按钮资源（用于资源绑定选择）
   * @returns 菜单按钮资源列表
   */
  queryMenuButtonResources(): Promise<MenuModel[]>;

  /**
   * 查询菜单接口资源（用于资源绑定选择）
   * @returns 菜单接口资源列表
   */
  queryMenuInterfaceResources(): Promise<InterfacePermission[]>;

  /**
   * 保存权限点（新增或更新，统一接口）
   * @param request 保存请求，包含权限点基础信息和资源绑定信息
   * @returns 保存结果
   */
  savePermission(request: SavePermissionRequest): Promise<boolean>;
}

/**
 * 权限点服务实现
 */
export const permissionService: IPermissionService = {
  /**
   * 删除权限点
   * @param id 权限点ID
   * @returns 删除结果
   */
  async deletePermission(id: string): Promise<boolean> {
    const response = await HttpRequest.post({
      url: PermissionAction.deletePermission,
      data: id,
      adapter: 'fetch',
    });
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
      adapter: 'fetch',
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
   * 更新权限点状态
   * @param id 权限点ID
   * @param status 状态 1-启用 0-停用
   * @returns 更新结果
   */
  async updatePermissionStatus(id: string, status: number): Promise<boolean> {
    const response = await HttpRequest.post({
      url: PermissionAction.updatePermissionStatus,
      data: { id, status },
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 批量导入权限点
   * @param file 文件
   * @returns 导入结果
   */
  async importPermissions(file: File): Promise<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await HttpRequest.post({
      url: PermissionAction.importPermissions,
      data: formData,
    });
    return response;
  },

  /**
   * 批量导出权限点
   * @param searchParams 查询参数
   * @returns 导出文件
   */
  async exportPermissions(searchParams: PermissionSearchParams): Promise<Blob> {
    const response = await HttpRequest.post(
      {
        url: PermissionAction.exportPermissions,
        data: searchParams,
        responseType: 'blob',
      },
      {
        successMessageMode: 'none',
        errorMessageMode: 'none',
      }
    );
    return response;
  },

  /**
   * 绑定权限资源
   * @param permissionId 权限点ID
   * @param resources 资源列表
   * @returns 绑定结果
   */
  async bindPermissionResources(permissionId: string, resources: PermissionResourceModel[]): Promise<boolean> {
    const response = await HttpRequest.post({
      url: PermissionAction.bindPermissionResources,
      data: { permissionId, resources },
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 查询权限已绑定的资源
   * @param permissionId 权限点ID
   * @returns 资源列表
   */
  async queryPermissionResources(permissionId: string): Promise<PermissionResourceModel[]> {
    const response = await HttpRequest.get({
      url: PermissionAction.queryPermissionResources,
      params: { permissionId },
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 查询菜单按钮资源（用于资源绑定选择）
   * @returns 菜单按钮资源列表
   */
  async queryMenuButtonResources(): Promise<MenuModel[]> {
    const response = await HttpRequest.get(
      {
        url: PermissionAction.queryMenuButtonResources,
        adapter: 'fetch',
      },
      {
        successMessageMode: 'none',
      }
    );
    return response;
  },

  /**
   * 查询菜单接口资源（用于资源绑定选择）
   * @returns 菜单接口资源列表
   */
  async queryMenuInterfaceResources(): Promise<InterfacePermission[]> {
    const response = await HttpRequest.get(
      {
        url: PermissionAction.queryMenuInterfaceResources,
        adapter: 'fetch',
      },
      {
        successMessageMode: 'none',
      }
    );
    return response;
  },

  /**
   * 保存权限点（新增或更新，统一接口）
   * @param request 保存请求，包含权限点基础信息和资源绑定信息
   * @returns 保存结果
   */
  async savePermission(request: SavePermissionRequest): Promise<boolean> {
    const response = await HttpRequest.post({
      url: PermissionAction.savePermission,
      data: request,
      adapter: 'fetch',
    });
    return response;
  },
};
