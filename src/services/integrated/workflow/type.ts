/**
 * 流程编排 API 类型定义
 * 与后端交互及前端 loadDocument 使用的数据结构
 */

/** 流程节点（与前端 WorkflowNode 结构一致，便于 loadDocument） */
export interface WorkflowConfigNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  [key: string]: unknown;
}

/** 流程边（与前端 WorkflowEdge 结构一致） */
export interface WorkflowConfigEdge {
  id?: string;
  source: string;
  target: string;
  [key: string]: unknown;
}

/** 流程配置元信息 */
export interface WorkflowConfigMeta {
  appId?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** 单节点类型的属性配置 schema 中表单项定义（后端可扩展） */
export interface NodePropertyConfigField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string | number }>;
  [k: string]: unknown;
}

/** 单节点类型的属性配置 schema（后端可扩展，用于服务端驱动表单） */
export interface NodePropertyConfigSchema {
  pluginId: string;
  schemaVersion?: string;
  /** 表单项/字段定义，与前端 ConfigPanel 或动态表单对接 */
  fields?: NodePropertyConfigField[];
  [key: string]: unknown;
}

/** 后端返回的流程配置（节点 + 边 + 可选节点属性配置） */
export interface WorkflowConfigResponse {
  version?: number;
  nodes: WorkflowConfigNode[];
  edges: WorkflowConfigEdge[];
  meta?: WorkflowConfigMeta;
  /** 各节点类型的属性配置 schema（可选） */
  nodePropertyConfigs?: Record<string, NodePropertyConfigSchema>;
}

/** 流程运行状态枚举 */
export type WorkflowRunStatus = 'idle' | 'running' | 'success' | 'failed';

/** 单节点执行状态（可选） */
export interface WorkflowNodeStatus {
  status: string;
  output?: unknown;
}

/** 流程运行状态接口响应 */
export interface WorkflowRunStatusResponse {
  status: WorkflowRunStatus;
  lastRunAt?: string;
  message?: string;
  executionId?: string;
  /** 各节点执行状态（可选） */
  nodeStatuses?: Record<string, WorkflowNodeStatus>;
}

/** 节点插件 DTO（/engine/node-plugins） */
export interface NodePluginDTO {
  pluginId: string;
  name: string;
  category: string;
  protocolType?: string;
  icon?: string;
  description?: string;
  configSchema?: Record<string, unknown>;
  version?: string;
  sortOrder?: number;
}

/** 流程版本 DTO */
export interface FlowVersionDTO {
  id?: string;
  appId?: string;
  versionNo: number;
  versionTag?: string;
  status?: string;
  nodeCount?: number;
  remark?: string;
  publishedTime?: string;
  flowDsl?: string;
}

/** 保存草稿请求体 */
export interface FlowDraftPayload {
  nodes: WorkflowConfigNode[];
  edges: WorkflowConfigEdge[];
}

/** 路由状态（部署） */
export interface RouteStatusDTO {
  appId: string;
  routeId: string;
  status: string;
  versionNo?: number;
  lastTriggered?: string;
}
