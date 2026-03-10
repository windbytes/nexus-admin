import { appTemplateCategoryService, appTemplateService } from '@/services/engine';
import type { AppTemplate, TemplateCategory, TemplateFilterOption, TemplateSearchParams } from './types';

/** 推荐分类的固定 id */
const RECOMMENDED_ID = 'recommended';

/**
 * 模板服务：对接后端应用模板分类与模板 API
 */
export const templateService = {
  /**
   * 获取模板分类列表（含推荐）
   */
  async getCategories(): Promise<TemplateCategory[]> {
    const list = await appTemplateCategoryService.list();
    const recommended = await appTemplateCategoryService.listRecommended();
    const recommendedIds = new Set(recommended.map((c) => String(c.id)));
    const categories: TemplateCategory[] = [
      { id: RECOMMENDED_ID, name: '推荐', icon: '⭐', count: 0, isRecommended: true },
      ...list.map((c) => ({
        id: String(c.id),
        name: c.name,
        icon: c.icon ?? '📁',
        count: 0,
        isRecommended: recommendedIds.has(String(c.id)),
      })),
    ];
    return categories;
  },

  /**
   * 获取筛选选项（简化：与分类一致或空）
   */
  async getFilterOptions(): Promise<TemplateFilterOption[]> {
    return [];
  },

  /**
   * 搜索/分页查询模板
   */
  async searchTemplates(params: TemplateSearchParams): Promise<{
    list: AppTemplate[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const categoryId =
      params.category && params.category !== RECOMMENDED_ID ? Number(params.category) : undefined;
    const pageNum = params.pageNum ?? 1;
    const pageSize = params.pageSize ?? 20;
    const list = await appTemplateService.list(categoryId, pageNum, pageSize);
    return {
      list: list.map(mapApiTemplateToLocal),
      total: list.length,
      pageNum,
      pageSize,
    };
  },

  /**
   * 根据分类获取模板
   */
  async getTemplatesByCategory(categoryId: string): Promise<AppTemplate[]> {
    if (categoryId === RECOMMENDED_ID) {
      const list = await appTemplateService.list(undefined, 1, 20);
      return list.map(mapApiTemplateToLocal);
    }
    const list = await appTemplateService.list(Number(categoryId), 1, 100);
    return list.map(mapApiTemplateToLocal);
  },

  /**
   * 从模板创建应用
   */
  async createAppFromTemplate(templateId: string, appName?: string): Promise<unknown> {
    return appTemplateService.createAppFromTemplate(templateId, { appName });
  },
};

function mapApiTemplateToLocal(t: {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  iconBg?: string;
  categoryId?: string;
  type: number;
  usageCount?: number;
  createTime?: string;
  updateTime?: string;
}): AppTemplate {
  return {
    id: String(t.id),
    name: t.name,
    type: 'workflow',
    description: t.description ?? '',
    icon: t.icon ?? '',
    iconBg: t.iconBg,
    category: t.categoryId ?? '',
    tags: [],
    createTime: t.createTime ?? '',
    updateTime: t.updateTime ?? '',
    usageCount: t.usageCount ?? 0,
    rating: 0,
  };
}
