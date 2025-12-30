import type { UserModel } from '@/services/system/user/type';
import type { PageQueryParams } from '@/types/global';

/**
 * 查询参数
 */
export interface UserSearchParams extends PageQueryParams {
  username?: string;
  sex?: 1 | 2;
  status?: 0 | 1;
}

/**
 * 用户列表响应
 */
export interface UserResponse {
  data: UserModel[];
  total: number;
}
