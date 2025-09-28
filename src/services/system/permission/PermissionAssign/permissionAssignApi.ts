import type { PageQueryParams, PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type { InterfacePermission } from '../../menu/menuApi';

/**
 * 权限分配相关接口枚举
 */
const PermissionAssignApi = {
  // 获取权限分配列表
  getPermissionAssignList: '/sys/permission/assign/list',
  // 分配角色权限
  assignRolePermission: '/sys/permission/assign/role',
  // 获取角色权限详情
  getRolePermissionDetail: '/sys/permission/assign/roleDetail',
  // 获取菜单接口列表
  getMenuInterfacePage: '/sys/permission/assign/getMenuInterfacePage',
};

/**
 * 权限分配查询参数
 */
export interface PermissionAssignSearchParams {
  roleId?: string;
  userId?: string;
  permissionType?: 'menu' | 'button' | 'interface';
  pageNumber?: number;
  pageSize?: number;
}

/**
 * 权限分配响应
 */
export interface PermissionAssignResponse {
  records: PermissionAssignItem[];
  pageNumber: number;
  pageSize: number;
  totalPage: number;
  totalRow: number;
}

/**
 * 权限分配项
 */
export interface PermissionAssignItem {
  id: string;
  roleId: string;
  roleName: string;
  permissionType: 'menu' | 'button' | 'interface';
  permissionId: string;
  permissionName: string;
  permissionCode: string;
  assignTime: string;
  assignBy: string;
}

/**
 * 接口分页查询参数
 */
interface MenuInterfacePageParams extends PageQueryParams{
  menuId?: string;
  code?: string;
  remark?: string;
  name?: string;
}

/**
 * 权限分配服务接口
 */
export interface IPermissionAssignService {
  /**
   * 获取权限分配列表
   * @param params 查询参数
   * @returns 权限分配列表
   */
  getPermissionAssignList(params: PermissionAssignSearchParams): Promise<PermissionAssignResponse>;

  /**
   * 分配角色权限
   * @param roleId 角色ID
   * @param permissionType 权限类型
   * @param permissionIds 权限ID列表
   * @returns 分配结果
   */
  assignRolePermission(
    roleId: string,
    permissionType: 'menu' | 'button' | 'interface',
    permissionIds: string[],
  ): Promise<boolean>;

  /**
   * 获取角色权限详情
   * @param roleCode 角色编码
   * @returns 角色权限详情
   */
  getRolePermissionDetail(roleCode: string): Promise<{
    menuPermissions: string[];
    buttonPermissions: string[];
    interfacePermissions: string[];
  }>;

  /**
   * 获取菜单接口列表
   * @param params 查询参数
   * @returns 菜单接口列表
   */
  getMenuInterfacePage(params: MenuInterfacePageParams): Promise<PageResult<InterfacePermission>>;
}

/**
 * 权限分配服务实现
 */
export const permissionAssignService: IPermissionAssignService = {
  /**
   * 获取权限分配列表
   */
  async getPermissionAssignList(params: PermissionAssignSearchParams): Promise<PermissionAssignResponse> {
    return HttpRequest.get<PermissionAssignResponse>({
      url: PermissionAssignApi.getPermissionAssignList,
      params,
    });
  },

  /**
   * 分配角色权限
   */
  async assignRolePermission(
    roleId: string,
    permissionType: 'menu' | 'button' | 'interface',
    permissionIds: string[],
  ): Promise<boolean> {
    return HttpRequest.post({
      url: PermissionAssignApi.assignRolePermission,
      data: { roleId, permissionType, permissionIds },
    });
  },

  /**
   * 获取角色权限详情
   */
  async getRolePermissionDetail(roleCode: string): Promise<{
    menuPermissions: string[];
    buttonPermissions: string[];
    interfacePermissions: string[];
  }> {
    return HttpRequest.get({
      url: PermissionAssignApi.getRolePermissionDetail,
      params: { roleCode },
    }, {successMessageMode: 'none'});
  },

  /**
   * 获取菜单接口列表
   */
  async getMenuInterfacePage(params: MenuInterfacePageParams): Promise<PageResult<InterfacePermission>> {
    return HttpRequest.post<PageResult<InterfacePermission>>({
      url: PermissionAssignApi.getMenuInterfacePage,
      data: params,
    }, {successMessageMode: 'none'});
  },
};
