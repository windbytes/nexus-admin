import type { PageQueryParams, PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type { InterfacePermission } from '../../menu/menuApi';

/**
 * 权限按钮相关接口枚举
 */
const PermissionButtonApi = {
  // 获取权限按钮列表
  getButtonList: '/system/permission/button/list',
  // 获取权限按钮详情
  getButtonDetail: '/system/permission/button/detail',
  // 新增权限按钮
  addButton: '/system/permission/button/add',
  // 编辑权限按钮
  updateButton: '/system/permission/button/update',
  // 删除权限按钮
  deleteButton: '/system/permission/button/delete',
  // 批量删除权限按钮
  batchDeleteButtons: '/system/permission/button/batchDelete',
  // 切换权限按钮状态
  toggleButtonStatus: '/system/permission/button/toggleStatus',
  // 获取按钮关联的接口权限
  getButtonInterfaces: '/system/permission/button/interfaces',
  // 获取所有接口权限
  getAllInterfaces: '/system/permission/interface/list',
  // 分配按钮接口权限
  assignButtonInterfaces: '/system/permission/button/assignInterfaces',
};

/**
 * 权限按钮数据类型
 */
export interface PermissionButtonModel {
  id: string;
  name: string;
  code: string;
  menuId: string;
  menuName: string;
  parentMenuId: string;
  parentMenuName: string;
  description?: string;
  status: boolean;
  sortNo: number;
  createTime: string;
  updateTime: string;
  createBy: string;
  updateBy: string;
}

/**
 * 权限按钮查询参数
 */
export interface ButtonSearchParams extends PageQueryParams {
  name?: string;
  code?: string;
  menuId?: string;
  status?: boolean;
}

/**
 * 权限按钮创建/更新参数
 */
export interface ButtonFormData {
  id?: string;
  name: string;
  code: string;
  menuId: string;
  description?: string;
  status?: boolean;
  sortNo?: number;
}

/**
 * 按钮接口权限关联
 */
export interface ButtonInterfacePermission {
  id: string;
  buttonId: string;
  interfaceId: string;
  interfaceCode: string;
  interfaceRemark: string;
  createTime: string;
}

/**
 * 权限按钮服务接口
 */
export interface IPermissionButtonService {
  /**
   * 获取权限按钮列表
   * @param params 查询参数
   * @returns 按钮列表
   */
  getButtonList(params: ButtonSearchParams): Promise<PageResult<PermissionButtonModel>>;

  /**
   * 获取权限按钮详情
   * @param buttonId 按钮ID
   * @returns 按钮详情
   */
  getButtonDetail(buttonId: string): Promise<PermissionButtonModel>;

  /**
   * 新增权限按钮
   * @param data 按钮数据
   * @returns 新增结果
   */
  addButton(data: ButtonFormData): Promise<boolean>;

  /**
   * 编辑权限按钮
   * @param data 按钮数据
   * @returns 编辑结果
   */
  updateButton(data: ButtonFormData): Promise<boolean>;

  /**
   * 删除权限按钮
   * @param buttonId 按钮ID
   * @returns 删除结果
   */
  deleteButton(buttonId: string): Promise<boolean>;

  /**
   * 批量删除权限按钮
   * @param buttonIds 按钮ID列表
   * @returns 删除结果
   */
  batchDeleteButtons(buttonIds: string[]): Promise<boolean>;

  /**
   * 切换权限按钮状态
   * @param buttonId 按钮ID
   * @param status 状态
   * @returns 切换结果
   */
  toggleButtonStatus(buttonId: string, status: boolean): Promise<boolean>;

  /**
   * 获取按钮关联的接口权限
   * @param buttonId 按钮ID
   * @returns 接口权限列表
   */
  getButtonInterfaces(buttonId: string): Promise<ButtonInterfacePermission[]>;

  /**
   * 获取所有接口权限
   * @returns 接口权限列表
   */
  getAllInterfaces(): Promise<InterfacePermission[]>;

  /**
   * 分配按钮接口权限
   * @param buttonId 按钮ID
   * @param interfaceIds 接口权限ID列表
   * @returns 分配结果
   */
  assignButtonInterfaces(buttonId: string, interfaceIds: string[]): Promise<boolean>;
}

/**
 * 权限按钮服务实现
 */
export const permissionButtonService: IPermissionButtonService = {
  /**
   * 获取权限按钮列表
   */
  async getButtonList(params: ButtonSearchParams): Promise<PageResult<PermissionButtonModel>> {
    return HttpRequest.get<PageResult<PermissionButtonModel>>(
      {
        url: PermissionButtonApi.getButtonList,
        params,
      },
      { successMessageMode: 'none' },
    );
  },

  /**
   * 获取权限按钮详情
   */
  async getButtonDetail(buttonId: string): Promise<PermissionButtonModel> {
    return HttpRequest.get<PermissionButtonModel>(
      {
        url: PermissionButtonApi.getButtonDetail,
        params: { buttonId },
      },
      { successMessageMode: 'none' },
    );
  },

  /**
   * 新增权限按钮
   */
  async addButton(data: ButtonFormData): Promise<boolean> {
    return HttpRequest.post({
      url: PermissionButtonApi.addButton,
      data,
    });
  },

  /**
   * 编辑权限按钮
   */
  async updateButton(data: ButtonFormData): Promise<boolean> {
    return HttpRequest.post({
      url: PermissionButtonApi.updateButton,
      data,
    });
  },

  /**
   * 删除权限按钮
   */
  async deleteButton(buttonId: string): Promise<boolean> {
    return HttpRequest.delete({
      url: PermissionButtonApi.deleteButton,
      params: { buttonId },
    });
  },

  /**
   * 批量删除权限按钮
   */
  async batchDeleteButtons(buttonIds: string[]): Promise<boolean> {
    return HttpRequest.post({
      url: PermissionButtonApi.batchDeleteButtons,
      data: { buttonIds },
    });
  },

  /**
   * 切换权限按钮状态
   */
  async toggleButtonStatus(buttonId: string, status: boolean): Promise<boolean> {
    return HttpRequest.post({
      url: PermissionButtonApi.toggleButtonStatus,
      data: { buttonId, status },
    });
  },

  /**
   * 获取按钮关联的接口权限
   */
  async getButtonInterfaces(buttonId: string): Promise<ButtonInterfacePermission[]> {
    return HttpRequest.get<ButtonInterfacePermission[]>(
      {
        url: PermissionButtonApi.getButtonInterfaces,
        params: { buttonId },
      },
      { successMessageMode: 'none' },
    );
  },

  /**
   * 获取所有接口权限
   */
  async getAllInterfaces(): Promise<InterfacePermission[]> {
    return HttpRequest.get<InterfacePermission[]>(
      {
        url: PermissionButtonApi.getAllInterfaces,
      },
      { successMessageMode: 'none' },
    );
  },

  /**
   * 分配按钮接口权限
   */
  async assignButtonInterfaces(buttonId: string, interfaceIds: string[]): Promise<boolean> {
    return HttpRequest.post({
      url: PermissionButtonApi.assignButtonInterfaces,
      data: { buttonId, interfaceIds },
    });
  },
};
