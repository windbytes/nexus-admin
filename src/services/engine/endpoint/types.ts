/**
 * Engine 端点管理模块类型定义
 * 与后端 entity/endpoint、dto 及 controller 对齐
 */

/** 端点（t_engine_endpoint） */
export interface Endpoint {
  id: string;
  name: string;
  description?: string;
  endpointType: string;
  category: string;
  mode?: string;
  status?: boolean;
  config?: Record<string, unknown>;
  tags?: string;
  remark?: string;
  delFlag?: boolean;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 端点类型配置（t_engine_endpoint_config） */
export interface EndpointConfig {
  id: string;
  endpointType: string;
  typeName: string;
  typeCode: string;
  icon?: string;
  supportMode?: unknown;
  description?: string;
  schemaVersion?: string;
  schemaFields?: unknown;
  status?: boolean;
  supportRetry?: boolean;
  delFlag?: boolean;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 端点搜索参数 */
export interface EndpointSearchParams {
  name?: string;
  code?: string;
  endpointType?: string;
  category?: string;
  status?: boolean;
  createBy?: string;
  pageNum?: number;
  pageSize?: number;
}
