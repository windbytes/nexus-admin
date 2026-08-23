import type { PageQueryParams } from '@/types/global';

/**
 * 用户列表查询参数
 */
export interface UserSearchParams extends PageQueryParams {
  username?: string;
  realName?: string;
  status?: 0 | 1;
}
