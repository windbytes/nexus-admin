import { HttpRequest } from '@/utils/request';
import type { InterfacePermission } from '../../menu/menuApi';
import type { MenuModel } from '../../menu/type';

/**
 * 权限按钮相关接口枚举
 */
const PermissionButtonApi = {
  // 获取权限按钮列表
  getButtonList: '/sys/permission/button/getButtonList',
  // 获取权限按钮详情
  getButtonDetail: '/sys/permission/button/detail',
  // 新增权限按钮
  addButton: '/sys/permission/button/add',
  // 编辑权限按钮
  updateButton: '/sys/permission/button/update',
  // 删除权限按钮
  deleteButton: '/sys/permission/button/delete',
  // 批量删除权限按钮
  batchDeleteButtons: '/sys/permission/button/batchDelete',
  // 删除按钮的映射接口
  deleteMapping: '/sys/permission/button/deleteMapping',
  // 切换权限按钮状态
  toggleButtonStatus: '/sys/permission/button/toggleStatus',
  // 获取按钮关联的接口权限
  getButtonInterfaces: '/sys/permission/button/interfaces',
  // 获取所有接口权限
  getNotAssignedInterfaces: '/sys/permission/button/getNotAssignedInterfaces',
  // 分配按钮接口权限
  assignButtonInterfaces: '/sys/permission/button/assignInterfaces',
};

/**
 * 权限按钮查询参数
 */
export interface ButtonSearchParams {
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
  perms: string;
  parentId: string;
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
  getButtonList(params: ButtonSearchParams): Promise<MenuModel[]>;

  /**
   * 获取权限按钮详情
   * @param buttonId 按钮ID
   * @returns 按钮详情
   */
  getButtonDetail(buttonId: string): Promise<MenuModel>;

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
   * 删除按钮的映射
   * @param buttonId 按钮ID
   * @param interfaces 权限接口ID
   */
  deleteMapping(buttonId: string, interfaces: string[]): Promise<boolean>;

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
   * @param buttonId 按钮ID
   * @returns 接口权限列表
   */
  getAllInterfaces(buttonId: string): Promise<InterfacePermission[]>;

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
  async getButtonList(params: ButtonSearchParams): Promise<MenuModel[]> {
    return HttpRequest.get<MenuModel[]>(
      {
        url: PermissionButtonApi.getButtonList,
        params,
        adapter: 'fetch',
      },
      { successMessageMode: 'none' },
    );
  },

  /**
   * 获取权限按钮详情
   */
  async getButtonDetail(buttonId: string): Promise<MenuModel> {
    return HttpRequest.get<MenuModel>(
      {
        url: PermissionButtonApi.getButtonDetail,
        params: { buttonId },
        adapter: 'fetch',
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
      adapter: 'fetch',
    });
  },

  /**
   * 编辑权限按钮
   */
  async updateButton(data: ButtonFormData): Promise<boolean> {
    return HttpRequest.post({
      url: PermissionButtonApi.updateButton,
      data,
      adapter: 'fetch',
    });
  },

  /**
   * 删除权限按钮
   */
  async deleteButton(buttonId: string): Promise<boolean> {
    return HttpRequest.delete({
      url: PermissionButtonApi.deleteButton,
      params: { buttonId },
      adapter: 'fetch',
    });
  },

  /**
   * 批量删除权限按钮
   */
  async batchDeleteButtons(buttonIds: string[]): Promise<boolean> {
    return HttpRequest.post({
      url: PermissionButtonApi.batchDeleteButtons,
      data: { buttonIds },
      adapter: 'fetch',
    });
  },

  /**
   * 删除按钮映射
   */
  async deleteMapping(buttonId: string, interfaces: string[]): Promise<boolean> {
    return HttpRequest.post<boolean>({
      url: PermissionButtonApi.deleteMapping,
      data: {
        buttonId,
        interfaces,
      },
      adapter: 'fetch',
    });
  },

  /**
   * 切换权限按钮状态
   */
  async toggleButtonStatus(buttonId: string, status: boolean): Promise<boolean> {
    return HttpRequest.post({
      url: PermissionButtonApi.toggleButtonStatus,
      data: { buttonId, status },
      adapter: 'fetch',
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
        adapter: 'fetch',
      },
      { successMessageMode: 'none' },
    );
  },

  /**
   * 获取所有接口权限
   */
  async getAllInterfaces(buttonId: string): Promise<InterfacePermission[]> {
    return HttpRequest.get<InterfacePermission[]>(
      {
        url: PermissionButtonApi.getNotAssignedInterfaces,
        params: { buttonId },
        adapter: 'fetch',
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
      adapter: 'fetch',
    });
  },
};
