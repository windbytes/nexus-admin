import { mockTemplates, mockCategories, mockFilterOptions } from './mockData';
import type { AppTemplate, TemplateCategory, TemplateFilterOption, TemplateSearchParams } from './types';

/**
 * 模拟API延迟
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 模拟的模板服务
 */
export const templateService = {
  /**
   * 获取模板分类列表
   */
  async getCategories(): Promise<TemplateCategory[]> {
    await delay(300);
    return mockCategories;
  },

  /**
   * 获取筛选选项
   */
  async getFilterOptions(): Promise<TemplateFilterOption[]> {
    await delay(200);
    return mockFilterOptions;
  },

  /**
   * 搜索模板
   */
  async searchTemplates(params: TemplateSearchParams): Promise<{
    list: AppTemplate[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    await delay(500);

    let filteredTemplates = [...mockTemplates];

    // 按关键词筛选
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredTemplates = filteredTemplates.filter(
        (template) =>
          template.name.toLowerCase().includes(keyword) ||
          template.description.toLowerCase().includes(keyword) ||
          template.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    }

    // 按类型筛选
    if (params.types && params.types.length > 0) {
      filteredTemplates = filteredTemplates.filter((template) => params.types!.includes(template.type));
    }

    // 按分类筛选
    if (params.category && params.category !== 'recommended') {
      filteredTemplates = filteredTemplates.filter((template) => template.category === params.category);
    }

    const total = filteredTemplates.length;
    const pageNum = params.pageNum || 1;
    const pageSize = params.pageSize || 20;

    // 分页
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    const list = filteredTemplates.slice(start, end);

    return {
      list,
      total,
      pageNum,
      pageSize,
    };
  },

  /**
   * 根据分类获取模板
   */
  async getTemplatesByCategory(categoryId: string): Promise<AppTemplate[]> {
    await delay(400);

    if (categoryId === 'recommended') {
      // 推荐分类返回评分最高的前20个模板
      return mockTemplates.sort((a, b) => b.rating - a.rating).slice(0, 20);
    }

    return mockTemplates.filter((template) => template.category === categoryId);
  },
};
