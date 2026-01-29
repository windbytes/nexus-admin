import type { PageQueryParams } from '@/types/global';

/**
 * 权限点查询参数
 */
export interface PermissionSearchParams extends PageQueryParams {
  permCode?: string;
  permName?: string;
  permType?: 'ACTION' | 'DATA';
  moduleCode?: string;
  status?: number;
}
