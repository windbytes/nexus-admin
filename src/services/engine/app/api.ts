/**
 * Engine 应用与标签 API
 * 路径与后端 /engine/apps、/engine/tags 一致
 */
import { HttpRequest } from '@/utils/request';
import type { EngineApp, Tag, AppQuery } from './types';

const AppsApi = {
  list: '/engine/apps',
  getById: (id: string) => `/engine/apps/${id}`,
  create: '/engine/apps',
  update: (id: string) => `/engine/apps/${id}`,
  delete: (id: string) => `/engine/apps/${id}`,
};

const TagsApi = {
  list: '/engine/tags',
  create: '/engine/tags',
  update: (id: string) => `/engine/tags/${id}`,
  delete: (id: string) => `/engine/tags/${id}`,
  bind: '/engine/tags/bind',
  unbind: '/engine/tags/unbind',
};

export const appService = {
  async getApps(params: AppQuery): Promise<EngineApp[]> {
    const res = await HttpRequest.get<EngineApp[]>({ url: AppsApi.list, params }, { successMessageMode: 'none' });
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
};

export const tagService = {
  async listTags(type?: string): Promise<Tag[]> {
    const res = await HttpRequest.get<Tag[]>(
      { url: TagsApi.list, params: type != null ? { type } : undefined },
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
