import type { PageQueryParams } from '@/types/global';

/**
 * 查询参数
 */
export interface EndpointSearchParams extends PageQueryParams {
  name?: string;
  code?: string;
  endpointType?: string;
  category?: string;
  status?: boolean;
}
