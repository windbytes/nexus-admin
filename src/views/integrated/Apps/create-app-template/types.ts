/**
 * 应用模板类型
 */
export interface AppTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  icon: string;
  iconBg?: string;
  category: string;
  tags: string[];
  createTime: string;
  updateTime: string;
  usageCount: number;
  rating: number;
}

/**
 * 模板类型枚举
 */
export type TemplateType = 'workflow' | 'chatflow' | 'chat_assistant' | 'agent' | 'text_generation';

/**
 * 模板分类
 */
export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  isRecommended?: boolean;
}

/**
 * 模板搜索参数
 */
export interface TemplateSearchParams {
  keyword?: string;
  types?: TemplateType[];
  category?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 模板筛选选项
 */
export interface TemplateFilterOption {
  label: string;
  value: TemplateType;
  count: number;
}
