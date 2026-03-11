/**
 * Engine 流程定义与版本模块类型定义
 * 与后端 entity/flow、dto/integration 及 controller 对齐
 */

/**
 * 流程逻辑定义，对应后端 FlowDefinition 实体（t_engine_flow_definition）
 */
export interface FlowDefinition {
  /** 流程定义主键（后端 Long，序列化为 string） */
  id: string;
  /** 租户 ID */
  tenantId: string;
  /** 所属应用 ID（关联 t_engine_app.id） */
  appId: string;
  /** 流程唯一标识（同租户同应用下唯一） */
  flowKey: string;
  /** 流程名称 */
  flowName: string;
  /** 流程描述 */
  description?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/**
 * 流程版本实体，对应后端 FlowVersion（t_engine_flow_version）
 */
export interface FlowVersion {
  id: string;
  /** 所属流程定义 ID */
  flowId: string;
  /** 版本号（同 flowId 下单调递增） */
  version: number;
  versionTag?: string;
  /** 版本状态：DRAFT/VALIDATING/PUBLISHING/PUBLISHED/PUBLISH_FAILED/DEPRECATED */
  status?: string;
  /** 是否当前在线版本 */
  current?: boolean;
  /** 流程配置完整快照（JSON） */
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

/**
 * 流程版本 DTO，对应后端 FlowVersionDTO（版本列表与详情响应）
 */
export interface FlowVersionDTO {
  id?: string;
  flowId?: string;
  /** 版本号 */
  version: number;
  versionTag?: string;
  /** 版本状态：DRAFT/VALIDATING/PUBLISHING/PUBLISHED/PUBLISH_FAILED/DEPRECATED */
  status?: string;
  current?: boolean;
  checksum?: string;
  publishedBy?: string;
  publishedTime?: string;
  publishError?: string;
  /** 版本详情接口可能返回的快照 */
  flowSnapshot?: unknown;
}

/**
 * 草稿节点，与后端 FlowNode（camel.model）对齐，用于保存草稿请求体
 */
export interface FlowDraftNode {
  id?: string;
  /** 节点在画布内唯一标识，对应 FlowEdge 的 sourceNodeKey/targetNodeKey */
  nodeKey: string;
  name?: string;
  description?: string;
  /** 节点业务配置（JSON） */
  config?: Record<string, unknown>;
  /** 前端 UI 配置（位置、尺寸等） */
  uiConfig?: Record<string, unknown>;
  pluginVersionId?: string;
  pluginId?: string;
  mode?: string;
}

/**
 * 草稿边，与后端 FlowEdge（camel.model）对齐，用于保存草稿请求体
 */
export interface FlowDraftEdge {
  id?: string;
  /** 源节点 nodeKey */
  sourceNodeKey: string;
  /** 目标节点 nodeKey */
  targetNodeKey: string;
  /** 条件表达式（Camel Simple 语法） */
  conditionExpr?: string;
}

/**
 * 保存草稿请求体，对应后端 FlowDraftDTO
 */
export interface FlowDraftPayload {
  nodes: FlowDraftNode[];
  edges: FlowDraftEdge[];
}

/**
 * 路由状态 DTO，对应后端 RouteStatusDTO
 */
export interface RouteStatusDTO {
  flowId: string;
  /** Camel 路由 ID（如 flow_{flowId}） */
  routeId: string;
  /** 运行状态：STARTED / STOPPED / SUSPENDED / ERROR */
  status: string;
  /** 当前在线版本号 */
  versionNo?: number;
  /** 最近触发时间（ISO 字符串） */
  lastTriggered?: string;
}

/**
 * 路由运行指标 DTO，对应后端 RouteMetricsDTO
 */
export interface RouteMetricsDTO {
  /** 总消息数 */
  totalMessages: number;
  /** 成功数 */
  successCount: number;
  /** 失败数 */
  errorCount: number;
  /** 成功率（0.0~1.0） */
  successRate: number;
}

/**
 * 分页结果，与后端 MyBatis-Flex Page 序列化结构对齐（listVersions 等）
 */
export interface Page<T> {
  /** 当前页数据列表（后端可能为 records 或 list） */
  records: T[];
  /** 总条数 */
  totalRow: number;
  pageNumber?: number;
  pageSize?: number;
}

// ─────────────────────── 从 workflow 迁入，供画布/运行状态/插件使用 ───────────────────────

/**
 * 流程运行状态展示（UI 用），由 RouteStatusDTO 映射：
 * STARTED → running，STOPPED → idle，ERROR → failed，SUSPENDED → idle
 */
export type FlowRunStatusView = 'idle' | 'running' | 'success' | 'failed';

/**
 * 流程运行状态展示 DTO（供 TopBar 等展示）
 * 由 getRouteStatus 返回的 RouteStatusDTO 映射得到
 */
export interface FlowRunStatusResponse {
  status: FlowRunStatusView;
  lastRunAt?: string;
  message?: string;
  /** 路由原始状态：STARTED / STOPPED / SUSPENDED / ERROR */
  routeStatus?: string;
}

/**
 * 流程配置节点（画布用，与 React Flow Node 兼容：id、type、position、data）
 */
export interface FlowConfigNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * 流程配置边（画布用，与 React Flow Edge 兼容：source、target）
 */
export interface FlowConfigEdge {
  id?: string;
  source: string;
  target: string;
  [key: string]: unknown;
}

/**
 * 流程配置元信息
 */
export interface FlowConfigMeta {
  appId?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * 流程文档响应（GET draft 转换后供 loadDocument 使用的结构）
 */
export interface FlowDocumentResponse {
  version?: number;
  nodes: FlowConfigNode[];
  edges: FlowConfigEdge[];
  meta?: FlowConfigMeta;
  nodePropertyConfigs?: Record<string, NodePropertyConfigSchema>;
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
  fields?: NodePropertyConfigField[];
  [key: string]: unknown;
}

/**
 * 节点插件 DTO（/engine/plugins/registry 或 /engine/plugins/available）
 */
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
