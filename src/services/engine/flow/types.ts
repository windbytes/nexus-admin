/**
 * Engine 流程定义与版本模块类型定义
 * 与后端 entity/flow 及 controller 对齐
 */

/** 流程逻辑定义（t_engine_flow_definition） */
export interface FlowDefinition {
  id: string;
  tenantId: string;
  appId: string;
  flowKey: string;
  flowName: string;
  description?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 流程版本（t_engine_flow_version） */
export interface FlowVersion {
  id: string;
  flowId: string;
  version: number;
  versionTag?: string;
  status?: string;
  current?: boolean;
  flowSnapshot?: unknown;
  checksum?: string;
  publishedBy?: string;
  publishedTime?: string;
  publishStatus?: string;
  publishError?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 草稿节点/边（与后端 camel.model 或 DTO 对齐） */
export interface FlowDraftNode {
  id?: string;
  nodeKey: string;
  name?: string;
  description?: string;
  config?: Record<string, unknown>;
  uiConfig?: Record<string, unknown>;
  pluginVersionId?: string;
  pluginId?: string;
  mode?: string;
}

export interface FlowDraftEdge {
  id?: string;
  sourceNodeKey: string;
  targetNodeKey: string;
  conditionExpr?: string;
}

/** 保存草稿请求体 */
export interface FlowDraftPayload {
  nodes: FlowDraftNode[];
  edges: FlowDraftEdge[];
}

/** 路由状态 DTO */
export interface RouteStatusDTO {
  flowId: string;
  routeId: string;
  status: string;
  version?: number;
  lastTriggered?: string;
}

/** 路由指标 DTO */
export interface RouteMetricsDTO {
  [key: string]: unknown;
}
