import type { UserModel } from '@/services/system/user/type';

/**
 * 查询参数
 */
export interface UserSearchParams {
  username?: string;
  sex?: 1 | 2;
  status?: 0 | 1;
  pageNum: number;
  pageSize: number;
}

/**
 * 用户列表响应
 */
export interface UserResponse {
  data: UserModel[];
  total: number;
}
