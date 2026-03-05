import { HttpRequest } from '@/utils/request';
import type { App, AppSearchParams } from './app';

/**
 * 项目相关接口
 */
const AppsApi = {
  /**
   * 获取项目列表
   */
  getApps: '/engine/apps/getApps',
  /**
   * 新增项目
   */
  addApp: '/engine/apps/addApp',

  /**
   * 更新项目
   */
  updateApp: '/engine/apps/updateApp',

  /**
   * 删除项目
   */
  deleteApp: '/engine/apps/deleteApp',

  /**
   * 复制应用
   */
  copyApp: '/engine/apps/copyApp',
};

/**
 * 项目服务接口
 */
export interface IAppsService {
  /**
   * 获取项目列表
   */
  getApps(searchParams: AppSearchParams): Promise<App[]>;

  /**
   * 新增项目
   */
  addApp(app: Partial<App>): Promise<boolean>;
  /**
   * 更新项目
   */
  updateApp(app: Partial<App>): Promise<boolean>;

  /**
   * 删除项目
   */
  deleteApp(appId: string): Promise<boolean>;

  /**
   * 复制应用
   */
  copyApp(app: Partial<App>): Promise<boolean>;
}

/**
 * 项目服务实现
 */
export const appsService: IAppsService = {
  /**
   * 获取项目列表
   */
  async getApps(searchParams: AppSearchParams): Promise<App[]> {
    const response = await HttpRequest.get(
      {
        url: AppsApi.getApps,
        params: searchParams,
      },
      {
        successMessageMode: 'none',
      }
    );
    return response;
  },
  /**
   * 新增项目
   */
  async addApp(app: Partial<App>): Promise<boolean> {
    const response = await HttpRequest.post({
      url: AppsApi.addApp,
      data: app,
    });
    return response;
  },
  /**
   * 更新项目
   */
  async updateApp(app: Partial<App>): Promise<boolean> {
    const response = await HttpRequest.post({
      url: AppsApi.updateApp,
      data: app,
    });
    return response;
  },

  /**
   * 删除项目
   */
  async deleteApp(appId: string): Promise<boolean> {
    const response = await HttpRequest.delete({
      url: AppsApi.deleteApp,
      data: { appId },
    });
    return response;
  },

  /**
   * 复制应用
   */
  async copyApp(app: Partial<App>): Promise<boolean> {
    const response = await HttpRequest.post({
      url: AppsApi.copyApp,
      data: app,
    });
    return response;
  },
};
