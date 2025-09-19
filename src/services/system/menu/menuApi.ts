import { HttpRequest } from '@/utils/request';
import type { MenuDirectoryItem, MenuModel } from './type';

// 接口权限数据类型
export interface InterfacePermission {
  id: string;
  code: string;
  name: string;
  path: string;
  method: string;
  remark: string;
  createTime: string;
  updateTime: string;
}

// 创建接口权限请求参数
export interface CreateInterfacePermissionRequest {
  menuId: string;
  code: string;
  remark: string;
  path: string;
  method: string;
  name: string;
}

// 更新接口权限请求参数
export interface UpdateInterfacePermissionRequest {
  id: string;
  code: string;
  remark: string;
  path: string;
  method: string;
  name: string;
}

// 查询接口权限列表请求参数
export interface QueryInterfacePermissionRequest {
  menuId: string;
  pageNumber?: number;
  pageSize?: number;
  code?: string;
  remark?: string;
}

// 查询接口权限列表响应
export interface QueryInterfacePermissionResponse {
  records: InterfacePermission[];
  pageNumber: number;
  pageSize: number;
  totalPage: number;
  totalRow: number;
}

// 菜单导入导出相关类型
export interface MenuExportParams {
  /**
   * 菜单名称（可选，用于筛选）
   */
  name?: string;
  /**
   * 角色ID（可选，用于导出指定角色的菜单）
   */
  roleId?: string;
  /**
   * 菜单ID列表（可选，用于导出指定菜单）
   */
  menuIds?: string[];
}

export interface MenuImportResult {
  /**
   * 导入是否成功
   */
  success: boolean;
  /**
   * 导入成功的数量
   */
  successCount?: number;
  /**
   * 导入失败的数量
   */
  failCount?: number;
  /**
   * 错误信息列表
   */
  errors?: string[];
  /**
   * 导入结果详情
   */
  details?: Array<{
    row: number;
    name: string;
    status: 'success' | 'fail';
    message?: string;
  }>;
}

/**
 * 菜单相关接口枚举
 */
const MenuApi = {
  // 根据token获取菜单（多用于框架上根据角色获取菜单那种）
  getMenuList: '/system/menu/getMenusByRole',
  // 获取所有菜单
  getAllMenus: '/system/menu/getAllMenus',
  // 获取所有上级菜单
  getDirectory: '/system/menu/getDirectory',
  // 添加菜单
  addMenu: '/system/menu/addMenu',
  // 编辑菜单
  updateMenu: '/system/menu/updateMenu',
  // 删除菜单
  deleteMenu: '/system/menu/deleteMenu',
  // 批量删除菜单
  deleteMenuBatch: '/system/menu/deleteMenuBatch',
  // 切换菜单状态
  toggleMenuStatus: '/system/menu/toggleMenuStatus',
  // 导出（Excel）
  exportMenus: '/system/menu/export',
  // 批量导入
  importMenus: '/system/menu/import',
  // 验证菜单权限
  checkPermission: '/system/menu/checkPermission',
  // 查询菜单接口权限列表
  queryInterfacePermissions: '/system/menuInterface/getMenuInterfacesByMenuId',
  // 创建菜单接口权限
  createInterfacePermission: '/system/menuInterface/addMenuInterface',
  // 更新菜单接口权限
  updateInterfacePermission: '/system/menuInterface/updateMenuInterface',
  // 删除菜单接口权限
  deleteInterfacePermission: '/system/menuInterface/deleteMenuInterface',
  // 批量删除菜单接口权限
  batchDeleteInterfacePermissions: '/system/menuInterface/deleteMenuInterfaceBatch',
};

/**
 * 菜单相关接口查询参数
 */
interface MenuSearchParams {
  /**
   * 菜单名称
   */
  name?: string;
}

/**
 * 菜单管理服务接口
 */
interface IMenuService {
  /**
   * 根据角色获取菜单
   * @param roleId 角色ID
   * @returns 菜单列表
   */
  getMenuListByRoleId(roleId: string): Promise<any[]>;

  /**
   * 查询所有菜单
   * @param params 查询参数
   * @returns 菜单列表
   */
  getAllMenus(params: MenuSearchParams): Promise<MenuModel[]>;

  /**
   * 获取所有的菜单目录（如果选中的是按钮，就不止以及菜单）
   * @returns 菜单列表
   */
  getDirectory(): Promise<MenuDirectoryItem[]>;

  /**
   * 新增菜单
   * @param params 菜单数据
   * @returns 新增结果
   */
  addMenu(params: Partial<MenuModel>): Promise<boolean>;

  /**
   * 修改菜单
   * @param params 菜单数据
   * @returns 修改结果
   */
  updateMenu(params: Partial<MenuModel>): Promise<boolean>;

  /**
   * 删除菜单
   * @param menuId 菜单ID
   * @returns 删除结果
   */
  deleteMenu(menuId: string): Promise<boolean>;

  /**
   * 批量删除菜单
   * @param menuIds 菜单ID列表
   * @returns 删除结果
   */
  deleteMenuBatch(menuIds: string[]): Promise<boolean>;

  /**
   * 切换菜单状态
   * @param id 菜单ID
   * @param status 状态
   * @returns 切换结果
   */
  toggleMenuStatus(id: string, status: boolean): Promise<boolean>;

  /**
   * 导出菜单（Excel格式）
   * @param params 导出参数
   * @returns Excel文件Blob
   */
  exportMenus(params: MenuExportParams): Promise<Blob>;

  /**
   * 导入菜单（Excel格式）
   * @param file Excel文件
   * @returns 导入结果
   */
  importMenus(file: File): Promise<MenuImportResult>;

  /**
   * 验证菜单权限
   * @param menuId 菜单ID
   * @returns 验证结果
   */
  checkPermission(menuId: string): Promise<boolean>;

  /**
   * 查询菜单接口权限列表
   * @param params 查询参数
   * @returns 接口权限列表
   */
  queryInterfacePermissions(params: QueryInterfacePermissionRequest): Promise<QueryInterfacePermissionResponse>;

  /**
   * 创建菜单接口权限
   * @param data 创建参数
   * @returns 创建结果
   */
  createInterfacePermission(
    data: CreateInterfacePermissionRequest,
  ): Promise<{ success: boolean; data?: InterfacePermission }>;

  /**
   * 更新菜单接口权限
   * @param data 更新参数
   * @returns 更新结果
   */
  updateInterfacePermission(
    data: UpdateInterfacePermissionRequest,
  ): Promise<{ success: boolean; data?: InterfacePermission }>;

  /**
   * 删除菜单接口权限
   * @param id 权限ID
   * @returns 删除结果
   */
  deleteInterfacePermission(id: string): Promise<boolean>;

  /**
   * 批量删除菜单接口权限
   * @param ids 权限ID数组
   * @returns 删除结果
   */
  batchDeleteInterfacePermissions(ids: string[]): Promise<boolean>;
}

/**
 * 菜单管理服务实现
 */
export const menuService: IMenuService = {
  /**
   * 根据角色获取菜单
   * @param roleId 角色ID
   * @returns 菜单列表
   */
  getMenuListByRoleId(roleId: string): Promise<any[]> {
    return HttpRequest.get(
      {
        url: MenuApi.getMenuList,
        params: { roleId },
      },
      { successMessageMode: 'none' },
    );
  },

  /**
   * 查询所有菜单
   * @param params 查询参数
   * @returns 菜单列表
   */
  async getAllMenus(params: MenuSearchParams): Promise<MenuModel[]> {
    const data = await HttpRequest.post(
      {
        url: MenuApi.getAllMenus,
        params,
      },
      { successMessageMode: 'none' },
    );
    return transformMenuData(data);
  },
  /**
   * 获取所有的一级菜单
   * @returns 菜单列表
   */
  getDirectory(): Promise<MenuDirectoryItem[]> {
    return HttpRequest.get(
      {
        url: MenuApi.getDirectory,
      },
      { successMessageMode: 'none' },
    );
  },
  /**
   * 新增菜单
   * @param params 菜单数据
   * @returns 新增结果
   */
  addMenu(params: Partial<MenuModel>): Promise<boolean> {
    return HttpRequest.post(
      {
        url: MenuApi.addMenu,
        data: params,
      },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * 修改菜单
   * @param params 菜单数据
   * @returns 修改结果
   */
  updateMenu(params: Partial<MenuModel>): Promise<boolean> {
    return HttpRequest.post(
      {
        url: MenuApi.updateMenu,
        data: params,
      },
      { errorMessageMode: 'none' },
    );
  },
  /**
   * 删除菜单
   * @param menuId 菜单ID
   * @returns 删除结果
   */
  deleteMenu(menuId: string): Promise<boolean> {
    return HttpRequest.delete(
      {
        url: MenuApi.deleteMenu,
        params: { menuId },
      },
      { errorMessageMode: 'none', successMessageMode: 'none' },
    );
  },
  /**
   * 批量删除菜单
   * @param menuIds 菜单ID列表
   * @returns 删除结果
   */
  deleteMenuBatch(menuIds: string[]): Promise<boolean> {
    return HttpRequest.delete({
      url: MenuApi.deleteMenuBatch,
      data: { menuIds },
    });
  },

  /**
   * 切换菜单状态
   * @param id 菜单ID
   * @param status 状态
   * @returns 切换结果
   */
  toggleMenuStatus(id: string, status: boolean): Promise<boolean> {
    return HttpRequest.post({
      url: MenuApi.toggleMenuStatus,
      data: { id, status },
    });
  },

  /**
   * 导出菜单（Excel格式）
   * @param params 导出参数
   * @returns Excel文件Blob
   */
  exportMenus(params: MenuExportParams): Promise<Blob> {
    return HttpRequest.post(
      {
        url: MenuApi.exportMenus,
        data: params,
        responseType: 'blob',
      },
      { successMessageMode: 'none', errorMessageMode: 'none' },
    );
  },
  /**
   * 导入菜单（Excel格式）
   * @param file Excel文件
   * @returns 导入结果
   */
  importMenus(file: File): Promise<MenuImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return HttpRequest.post(
      {
        url: MenuApi.importMenus,
        data: formData,
      },
      { successMessageMode: 'none', errorMessageMode: 'none' },
    );
  },
  /**
   * 验证菜单权限
   * @param menuId 菜单ID
   * @returns 验证结果
   */
  checkPermission(menuId: string): Promise<boolean> {
    return HttpRequest.post({
      url: MenuApi.checkPermission,
      data: { menuId },
    });
  },

  /**
   * 查询菜单接口权限列表
   * @param params 查询参数
   * @returns 接口权限列表
   */
  queryInterfacePermissions(params: QueryInterfacePermissionRequest): Promise<QueryInterfacePermissionResponse> {
    return HttpRequest.get<QueryInterfacePermissionResponse>(
      {
        url: MenuApi.queryInterfacePermissions,
        params,
      },
      { successMessageMode: 'none' },
    );
  },

  /**
   * 创建菜单接口权限
   * @param data 创建参数
   * @returns 创建结果
   */
  createInterfacePermission(
    data: CreateInterfacePermissionRequest,
  ): Promise<{ success: boolean; data?: InterfacePermission }> {
    return HttpRequest.post<{ success: boolean; data?: InterfacePermission }>({
      url: MenuApi.createInterfacePermission,
      data,
    });
  },

  /**
   * 更新菜单接口权限
   * @param data 更新参数
   * @returns 更新结果
   */
  updateInterfacePermission(
    data: UpdateInterfacePermissionRequest,
  ): Promise<{ success: boolean; data?: InterfacePermission }> {
    return HttpRequest.post<{ success: boolean; data?: InterfacePermission }>({
      url: MenuApi.updateInterfacePermission,
      data,
    });
  },

  /**
   * 删除菜单接口权限
   * @param id 权限ID
   * @returns 删除结果
   */
  deleteInterfacePermission(id: string): Promise<boolean> {
    return HttpRequest.delete<boolean>({
      url: MenuApi.deleteInterfacePermission,
      params: { id },
    });
  },

  /**
   * 批量删除菜单接口权限
   * @param ids 权限ID数组
   * @returns 删除结果
   */
  batchDeleteInterfacePermissions(ids: string[]): Promise<boolean> {
    return HttpRequest.delete<boolean>({
      url: MenuApi.batchDeleteInterfacePermissions,
      data: { ids },
    });
  },
};

/**
 * 转换菜单数据，children没有数据的转换为null
 * @param data
 */
function transformMenuData(data: any) {
  return data.map((item: any) => ({
    ...item,
    children: item.children?.length ? transformMenuData(item.children) : null,
  }));
}
