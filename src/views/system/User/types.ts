import type { PageQueryParams } from '@/types/global';

/**
 * 查询参数
 */
export interface UserSearchParams extends PageQueryParams {
  username?: string;
  sex?: 1 | 2;
  status?: 0 | 1;
}
