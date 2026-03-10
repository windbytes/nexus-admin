import type { PageQueryParams } from '@/types/global';

/**
 * 权限点搜索参数
 */
export interface PermissionSearchParams extends PageQueryParams {
  /** 权限点编码 */
  permCode?: string;
  /** 权限点名称 */
  permName?: string;
  /** 资源类型 */
  resourceType?: number;
  /** 状态 */
  status?: boolean;
}
