/**
 * Engine 端点管理模块类型定义
 * 与后端 entity/endpoint、dto 及 controller 对齐；原 integrated/endpoint 用到的类型已迁移至此
 */

/**
 * 端点实体（与后端 t_engine_endpoint 表对应）
 * id 为后端 Long 序列化后的字符串
 */
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

/** 端点类型配置（t_engine_endpoint_config，与后端 EndpointConfig 对齐） */
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

/** 端点搜索参数（与后端 EndpointSearchParams 对齐） */
export interface EndpointSearchParams {
  name?: string;
  code?: string;
  endpointType?: string;
  category?: string;
  status?: boolean;
  createBy?: string;
  pageNum?: number;
  pageSize?: number;
  total?: number;
}

/** 端点表单数据（新增/编辑时提交） */
export interface EndpointFormData {
  id?: string;
  name: string;
  description?: string;
  endpointType: string;
  category?: string;
  mode?: string;
  config?: Record<string, unknown>;
  status?: boolean;
  tags?: string;
  remark?: string;
}

/** 端点类型枚举（与后端 endpointType 取值一致） */
export enum EndpointType {
  HTTP = 'http',
  DATABASE = 'database',
  WEBSERVICE = 'webservice',
  FILE = 'file',
  TIMER = 'timer',
  MQ = 'mq',
}

/** 下拉选项项 */
export interface EndpointSelectOption {
  value: string;
  label: string;
}

/** 端点分类选项（与后端 category 取值一致） */
export const ENDPOINT_CATEGORIES: EndpointSelectOption[] = [
  { value: 'api', label: 'API接口' },
  { value: 'integration', label: '系统集成' },
  { value: 'data', label: '数据处理' },
  { value: 'schedule', label: '定时任务' },
  { value: 'message', label: '消息队列' },
  { value: 'custom', label: '自定义' },
];

/** 端点类型选项 */
export const ENDPOINT_TYPE_OPTIONS: EndpointSelectOption[] = [
  { value: 'http', label: 'HTTP/Web服务' },
  { value: 'database', label: '数据库/数据存储' },
  { value: 'webservice', label: 'WebService/Web服务' },
  { value: 'file', label: '文件与系统/IO' },
  { value: 'timer', label: '定时器/调度' },
  { value: 'mq', label: '消息中间件/队列' },
];

// ---------- 测试 / 校验（与后端 DTO 对齐） ----------

/** 端点测试请求（与后端 EndpointTestDTO 对齐） */
export interface EndpointTestRequest {
  endpointId?: string;
  endpointType: string;
  config: Record<string, unknown>;
  testParams?: Record<string, unknown>;
}

/** 端点测试响应（与后端 EndpointTestResultDTO 对齐） */
export interface EndpointTestResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime?: number;
}

/** 端点配置校验结果（与后端 EndpointValidateResultDTO 对齐） */
export interface EndpointValidateResult {
  valid: boolean;
  errors?: string[];
}

// ---------- 表单 Schema（与后端 EndpointConfig.schemaFields 结构一致） ----------

/** 表单 Schema 字段配置（驱动动态表单渲染） */
export interface FormSchemaField {
  field: string;
  label: string;
  component: string;
  required?: boolean;
  defaultValue?: unknown;
  componentProps?: Record<string, unknown>;
  rules?: unknown[];
  formItemProps?: Record<string, unknown>;
}

/** 端点类型配置 Schema（前端用于动态表单；后端返回 EndpointConfig，schemaFields 即此类数组） */
export interface EndpointConfigSchema {
  id: string;
  endpointType: string;
  schemaName?: string;
  schemaVersion?: string;
  schemaConfig?: FormSchemaField[];
  schemaFields?: FormSchemaField[];
  status?: boolean;
  description?: string;
  typeName?: string;
  typeCode?: string;
  createTime?: string;
  updateTime?: string;
}

/** 作用模式选项（与后端 supportMode 取值一致） */
export const MODE_OPTIONS = [
  { value: 'IN_OUT', label: 'IN_OUT' },
  { value: 'IN', label: 'IN' },
  { value: 'OUT', label: 'OUT' },
  { value: 'OUT_IN', label: 'OUT_IN' },
] as const;

/** Schema 字段配置（与 integrated SchemaField 兼容，用于动态表单） */
export interface SchemaField {
  id?: string;
  field: string;
  label: string;
  component: string;
  properties?: Record<string, unknown>;
  componentProps?: Record<string, unknown>;
  rules?: string | unknown[];
  showCondition?: string;
  sortOrder?: number;
  mode?: string[];
  description?: string;
}

/** 端点类型配置（与 EndpointConfig 及 integrated EndpointTypeConfig 兼容） */
export interface EndpointTypeConfig {
  id: string;
  endpointType: string;
  typeName: string;
  typeCode: string;
  icon?: string;
  supportMode?: string[] | unknown;
  description?: string;
  schemaVersion?: string;
  schemaFields: SchemaField[] | FormSchemaField[];
  status?: boolean;
  supportRetry?: boolean;
  delFlag?: boolean;
  createTime?: string;
  updateTime?: string;
  createBy?: string;
  updateBy?: string;
}
