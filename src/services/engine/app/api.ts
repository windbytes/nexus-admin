import type { Tag } from '@/components/base/tag-management/constant';
import { HttpRequest } from '@/utils/request';
import type {
  AppCategory,
  AppExportVO,
  AppImportRequest,
  AppQuery,
  AppTemplate,
  AppTemplateCategory,
  CreateAppFromTemplateRequest,
  EngineApp,
  SaveAppTemplateRequest,
} from './types';

/**
 * Engine 应用与标签 API
 * 路径与后端 /engine/apps、/engine/tags 一致
 */
const AppsApi = {
  list: '/engine/apps',
  getById: (id: string) => `/engine/apps/${id}`,
  create: '/engine/apps/create',
  update: (id: string) => `/engine/apps/update/${id}`,
  delete: (id: string) => `/engine/apps/delete/${id}`,
  export: (id: string) => `/engine/apps/${id}/export`,
  import: '/engine/apps/import',
};

const TagsApi = {
  getTagsList: '/engine/tags/getTagsList',
  create: '/engine/tags/create',
  update: (id: string) => `/engine/tags/update/${id}`,
  delete: (id: string) => `/engine/tags/delete/${id}`,
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

  async createApp(app: Partial<EngineApp>): Promise<boolean> {
    return HttpRequest.post<boolean>({ url: AppsApi.create, data: app });
  },

  async updateApp(id: string, app: Partial<EngineApp>): Promise<EngineApp> {
    return HttpRequest.post<EngineApp>({ url: AppsApi.update(id), data: { ...app, id } });
  },

  async deleteApp(id: string): Promise<void> {
    await HttpRequest.post({ url: AppsApi.delete(id) });
  },

  /**
   * 导出应用及其下所有流程的编排数据，用于下载或导入。
   * @param id 应用 ID
   * @returns 应用基础信息 + 各流程的 flowDefinition 与 flowSnapshot
   */
  async exportApp(id: string): Promise<AppExportVO> {
    return HttpRequest.get<AppExportVO>({ url: AppsApi.export(id) }, { successMessageMode: 'none' });
  },

  /**
   * 导入应用：从导出数据创建新应用（可覆盖应用名称）。
   * @param request payload 为导出数据，appName 可选覆盖名称
   */
  async importApp(request: AppImportRequest): Promise<EngineApp> {
    return HttpRequest.post<EngineApp>({ url: AppsApi.import, data: request });
  },
};

/**
 * 应用分类 API，路径与后端 /engine/app-categories 一致
 */
const AppCategoriesApi = {
  list: '/engine/app-categories',
  getById: (id: string) => `/engine/app-categories/${id}`,
};

export const appCategoryService = {
  /** 查询应用分类列表，按 sort_order 升序 */
  async getAppCategories(): Promise<AppCategory[]> {
    const res = await HttpRequest.get<AppCategory[]>({ url: AppCategoriesApi.list }, { successMessageMode: 'none' });
    return res ?? [];
  },
  getById(id: string): Promise<AppCategory | null> {
    return HttpRequest.get<AppCategory>({ url: AppCategoriesApi.getById(id) }, { successMessageMode: 'none' });
  },
};

/**
 * 应用模板分类 API，路径与后端 /engine/app-template-categories 一致
 */
const AppTemplateCategoriesApi = {
  list: '/engine/app-template-categories',
  recommended: '/engine/app-template-categories/recommended',
};

export const appTemplateCategoryService = {
  async list(): Promise<AppTemplateCategory[]> {
    const res = await HttpRequest.get<AppTemplateCategory[]>(
      { url: AppTemplateCategoriesApi.list },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },
  async listRecommended(): Promise<AppTemplateCategory[]> {
    const res = await HttpRequest.get<AppTemplateCategory[]>(
      { url: AppTemplateCategoriesApi.recommended },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },
};

/**
 * 应用模板 API，路径与后端 /engine/app-templates 一致
 */
const AppTemplatesApi = {
  list: '/engine/app-templates',
  getById: (id: string) => `/engine/app-templates/${id}`,
  saveFromApp: (appId: string) => `/engine/app-templates/save-from-app/${appId}`,
  createApp: (templateId: string) => `/engine/app-templates/${templateId}/create-app`,
};

export const appTemplateService = {
  /** 将应用存为模板（方案 A） */
  async saveAppAsTemplate(appId: string, request: SaveAppTemplateRequest): Promise<AppTemplate> {
    return HttpRequest.post<AppTemplate>({ url: AppTemplatesApi.saveFromApp(appId), data: request });
  },
  /** 从模板创建应用 */
  async createAppFromTemplate(templateId: string, request?: CreateAppFromTemplateRequest): Promise<EngineApp> {
    return HttpRequest.post<EngineApp>({
      url: AppTemplatesApi.createApp(templateId),
      data: request ?? {},
    });
  },
  getById(templateId: string): Promise<AppTemplate | null> {
    return HttpRequest.get<AppTemplate>({ url: AppTemplatesApi.getById(templateId) }, { successMessageMode: 'none' });
  },
  async list(params?: { categoryId?: string; pageNum?: number; pageSize?: number }): Promise<AppTemplate[]> {
    const res = await HttpRequest.get<AppTemplate[]>(
      { url: AppTemplatesApi.list, params: params ?? {} },
      { successMessageMode: 'none' }
    );
    return res ?? [];
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
    return HttpRequest.post<Tag>({ url: TagsApi.create, data: tag }, { successMessageMode: 'none' });
  },

  async updateTag(id: string, tag: Partial<Tag>): Promise<Tag> {
    return HttpRequest.post<Tag>({ url: TagsApi.update(id), data: { ...tag, id } }, { successMessageMode: 'none' });
  },

  async deleteTag(id: string): Promise<boolean> {
    return HttpRequest.post<boolean>({ url: TagsApi.delete(id) }, { successMessageMode: 'none' });
  },

  async bindTags(tagIds: string[], appId: string): Promise<boolean> {
    return HttpRequest.post<boolean>(
      {
        url: TagsApi.bind,
        data: {
          tagIds: tagIds,
          appId: appId,
        },
      },
      { successMessageMode: 'none' }
    );
  },

  async unbindTag(tagId: string, appId: string): Promise<boolean> {
    return HttpRequest.post<boolean>(
      {
        url: TagsApi.unbind,
        data: {
          tagId: tagId,
          appId: appId,
        },
      },
      { successMessageMode: 'none' }
    );
  },
};
