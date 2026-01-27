import type { PageQueryParams } from '@/types/global';

/**
 * 菜单查询参数
 */
export interface MenuSearchParams extends PageQueryParams {
  name?: string;
  status?: boolean;
  menuType?: number;
}

