import type { PageQueryParams } from '@/types/global';

/**
 * 字典列表查询参数（与 SearchForm 表单项对应）
 */
export interface DictSearchParams extends PageQueryParams {
  dictCode?: string;
  dictName?: string;
  dictType?: string;
  enabled?: boolean;
}
