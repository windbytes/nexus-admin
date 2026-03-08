import { HttpRequest } from '@/utils/request';
import type { AppExportVO, AppImportRequest, AppQuery, EngineApp, Tag } from './types';

/**
 * Engine 应用与标签 API
 * 路径与后端 /engine/apps、/engine/tags 一致
 */
const AppsApi = {
  list: '/engine/apps',
  getById: (id: string) => `/engine/apps/${id}`,
  create: '/engine/apps',
  update: (id: string) => `/engine/apps/${id}`,
  delete: (id: string) => `/engine/apps/${id}`,
  export: (id: string) => `/engine/apps/${id}/export`,
  import: '/engine/apps/import',
};

const TagsApi = {
  getTagsList: '/engine/tags/getTagsList',
  create: '/engine/tags',
  update: (id: string) => `/engine/tags/${id}`,
  delete: (id: string) => `/engine/tags/${id}`,
  bind: '/engine/tags/bind',
  unbind: '/engine/tags/unbind',
};

export const appService = {
  async getApps(params: AppQuery): Promise<EngineApp[]> {
    const { tags, ...rest } = params;
    const requestParams = {
      ...rest,
      ...(tags?.length ? { tagIDs: tags.join('|') } : {}),
    };
    const res = await HttpRequest.get<EngineApp[]>(
      { url: AppsApi.list, params: requestParams },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },

  async getAppById(id: string): Promise<EngineApp | null> {
    return HttpRequest.get<EngineApp>({ url: AppsApi.getById(id) }, { successMessageMode: 'none' });
  },

  async createApp(app: Partial<EngineApp>): Promise<EngineApp> {
    return HttpRequest.post<EngineApp>({ url: AppsApi.create, data: app });
  },

  async updateApp(id: string, app: Partial<EngineApp>): Promise<EngineApp> {
    return HttpRequest.put<EngineApp>({ url: AppsApi.update(id), data: { ...app, id } });
  },

  async deleteApp(id: string): Promise<void> {
    await HttpRequest.delete({ url: AppsApi.delete(id) });
  },

  /**
   * 导出应用及其下所有流程的编排数据，用于下载或导入。
   * @param id 应用 ID
   * @returns 应用基础信息 + 各流程的 flowDefinition 与 flowSnapshot
   */
  async exportApp(id: string): Promise<AppExportVO> {
    return HttpRequest.get<AppExportVO>(
      { url: AppsApi.export(id) },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 导入应用：从导出数据创建新应用（可覆盖应用名称）。
   * @param request payload 为导出数据，appName 可选覆盖名称
   */
  async importApp(request: AppImportRequest): Promise<EngineApp> {
    return HttpRequest.post<EngineApp>({ url: AppsApi.import, data: request });
  },
};

export const tagService = {
  async listTags(type?: string): Promise<Tag[]> {
    const res = await HttpRequest.get<Tag[]>(
      { url: TagsApi.getTagsList, params: type != null ? { type } : undefined },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },

  async createTag(tag: Partial<Tag>): Promise<Tag> {
    return HttpRequest.post<Tag>({ url: TagsApi.create, data: tag });
  },

  async updateTag(id: string, tag: Partial<Tag>): Promise<Tag> {
    return HttpRequest.put<Tag>({ url: TagsApi.update(id), data: { ...tag, id } });
  },

  async deleteTag(id: string): Promise<boolean> {
    return HttpRequest.delete<boolean>({ url: TagsApi.delete(id) });
  },

  async bindTags(tagIds: string[], appId: string): Promise<boolean> {
    return HttpRequest.post<boolean>({ url: TagsApi.bind, params: { tagIds, appId } });
  },

  async unbindTag(tagId: string, appId: string): Promise<boolean> {
    return HttpRequest.delete<boolean>({ url: TagsApi.unbind, params: { tagId, appId } });
  },
};
