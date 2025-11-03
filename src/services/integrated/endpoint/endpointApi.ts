import type { PageQueryParams, PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';

/**
 * 端点类型枚举
 */
export enum EndpointType {
  HTTP = 'http',
  DATABASE = 'database',
  WEBSERVICE = 'webservice',
  FILE = 'file',
  TIMER = 'timer',
  MQ = 'mq',
}

/**
 * 端点分类
 */
export const ENDPOINT_CATEGORIES = [
  { value: 'api', label: 'API接口' },
  { value: 'integration', label: '系统集成' },
  { value: 'data', label: '数据处理' },
  { value: 'schedule', label: '定时任务' },
  { value: 'message', label: '消息队列' },
  { value: 'custom', label: '自定义' },
] as const;

/**
 * 端点类型选项
 */
export const ENDPOINT_TYPE_OPTIONS = [
  { value: 'http', label: 'HTTP/Web服务' },
  { value: 'database', label: '数据库/数据存储' },
  { value: 'webservice', label: 'WebService/Web服务' },
  { value: 'file', label: '文件与系统/IO' },
  { value: 'timer', label: '定时器/调度' },
  { value: 'mq', label: '消息中间件/队列' },
] as const;

/**
 * HTTP端点配置
 */
export interface HttpEndpointConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  bodyType?: 'json' | 'form' | 'xml' | 'raw';
  bodyTemplate?: string;
  authType?: 'none' | 'basic' | 'bearer' | 'oauth2' | 'apikey';
  authConfig?: Record<string, any>;
  timeout?: number;
  retryTimes?: number;
  retryInterval?: number;
  responseType?: 'json' | 'xml' | 'text' | 'binary';
  successCondition?: string;
}

/**
 * 数据库端点配置
 */
export interface DatabaseEndpointConfig {
  databaseType: 'mysql' | 'oracle' | 'sqlserver' | 'postgresql' | 'mongodb';
  driverId?: string;
  connectionString?: string;
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
  sqlType?: 'select' | 'insert' | 'update' | 'delete' | 'procedure' | 'function';
  sqlTemplate?: string;
  procedureName?: string;
  inputParams?: Array<{ name: string; type: string; required: boolean }>;
  outputParams?: Array<{ name: string; type: string }>;
  poolConfig?: Record<string, any>;
  transactionEnabled?: boolean;
  isolationLevel?: string;
}

/**
 * WebService端点配置
 */
export interface WebServiceEndpointConfig {
  wsdlUrl?: string;
  wsdlContent?: string;
  serviceName?: string;
  portName?: string;
  operationName?: string;
  soapVersion?: '1.1' | '1.2';
  namespaceUri?: string;
  authType?: 'none' | 'wss' | 'basic' | 'custom';
  authConfig?: Record<string, any>;
  requestTemplate?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * 文件端点配置
 */
export interface FileEndpointConfig {
  fileType: 'local' | 'ftp' | 'sftp' | 'http' | 'oss';
  filePath?: string;
  filePattern?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  ossConfig?: Record<string, any>;
  encoding?: string;
  parseType?: 'text' | 'json' | 'xml' | 'csv' | 'excel' | 'binary';
}

/**
 * 定时器端点配置
 */
export interface TimerEndpointConfig {
  scheduleType: 'cron' | 'interval' | 'once';
  cronExpression?: string;
  intervalValue?: number;
  intervalUnit?: 'second' | 'minute' | 'hour' | 'day';
  startTime?: string;
  endTime?: string;
  maxExecutions?: number;
  concurrentEnabled?: boolean;
}

/**
 * MQ端点配置
 */
export interface MqEndpointConfig {
  mqType: 'rabbitmq' | 'kafka' | 'activemq' | 'rocketmq';
  host?: string;
  port?: number;
  virtualHost?: string;
  username?: string;
  password?: string;
  queueName?: string;
  topicName?: string;
  exchangeName?: string;
  routingKey?: string;
  consumerConfig?: Record<string, any>;
  producerConfig?: Record<string, any>;
}

/**
 * 端点配置联合类型
 */
export type EndpointConfig =
  | HttpEndpointConfig
  | DatabaseEndpointConfig
  | WebServiceEndpointConfig
  | FileEndpointConfig
  | TimerEndpointConfig
  | MqEndpointConfig;

/**
 * 端点基础信息
 */
export interface Endpoint {
  id: string;
  name: string;
  description?: string;
  endpointType: EndpointType | string;
  category: string;
  mode: string; // 模式
  config?: { [key: string]: any };
  status: boolean;
  tags?: string[];
  remark?: string;
  createTime?: string;
  updateTime?: string;
  createBy?: string;
  updateBy?: string;
}

/**
 * 端点搜索参数
 */
export interface EndpointSearchParams extends PageQueryParams {
  name?: string;
  endpointType?: string;
  category?: string;
  status?: boolean;
}

/**
 * 端点表单数据
 */
export interface EndpointFormData {
  id?: string;
  name: string;
  description?: string;
  endpointType: string;
  category?: string;
  config?: any;
  status?: boolean;
  tags?: string[];
  remark?: string;
}

/**
 * 端点测试请求
 */
export interface EndpointTestRequest {
  endpointId?: string;
  endpointType: string;
  config: any;
  testParams?: Record<string, any>;
}

/**
 * 端点测试响应
 */
export interface EndpointTestResponse {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

/**
 * 表单Schema字段配置
 */
export interface FormSchemaField {
  field: string;
  label: string;
  component: string;
  required?: boolean | ((values: any) => boolean);
  defaultValue?: any | ((values: any) => any);
  componentProps?: any;
  rules?: any[];
  show?: (values: any) => boolean;
  formItemProps?: any;
}

/**
 * 端点配置Schema
 */
export interface EndpointConfigSchema {
  id: string;
  endpointType: string;
  schemaName: string;
  schemaVersion: string;
  schemaConfig: FormSchemaField[];
  status: boolean;
  description?: string;
  createTime?: string;
  updateTime?: string;
}

/**
 * 端点API路径
 */
enum EndpointAction {
  /**
   * 分页查询端点列表
   */
  list = '/integrated/endpoint/list',
  /**
   * 新增端点
   */
  add = '/integrated/endpoint/add',
  /**
   * 更新端点
   */
  update = '/integrated/endpoint/update',
  /**
   * 删除端点
   */
  delete = '/integrated/endpoint/delete',
  /**
   * 批量删除端点
   */
  batchDelete = '/integrated/endpoint/batchDelete',
  /**
   * 获取端点详情
   */
  detail = '/integrated/endpoint/detail',
  /**
   * 测试端点
   */
  test = '/integrated/endpoint/test',
  /**
   * 验证端点配置
   */
  validateConfig = '/integrated/endpoint/validateConfig',
  /**
   * 导出端点配置
   */
  exportConfig = '/integrated/endpoint/exportConfig',
  /**
   * 导入端点配置
   */
  importConfig = '/integrated/endpoint/importConfig',
  /**
   * 获取端点配置Schema
   */
  getConfigSchema = '/integrated/endpoint/getConfigSchema',
}

/**
 * 端点服务
 */
export const endpointService = {
  /**
   * 分页查询端点列表
   */
  async getEndpointList(params: EndpointSearchParams): Promise<PageResult<Endpoint>> {
    const response = await HttpRequest.post<PageResult<Endpoint>>(
      {
        url: EndpointAction.list,
        data: params,
      },
      { successMessageMode: 'none' }
    );

    return response;
  },

  /**
   * 新增端点
   */
  async addEndpoint(data: EndpointFormData): Promise<Endpoint> {
    const response = await HttpRequest.post<Endpoint>({
      url: EndpointAction.add,
      data,
    });
    return response;
  },

  /**
   * 更新端点
   */
  async updateEndpoint(data: EndpointFormData): Promise<Endpoint> {
    const response = await HttpRequest.post<Endpoint>({
      url: EndpointAction.update,
      data,
    });
    return response;
  },

  /**
   * 删除端点
   */
  async deleteEndpoint(id: string): Promise<boolean> {
    const response = await HttpRequest.post<boolean>({
      url: EndpointAction.delete,
      params: { id },
    });
    return response;
  },

  /**
   * 批量删除端点
   */
  async batchDeleteEndpoint(ids: string[]): Promise<boolean> {
    const response = await HttpRequest.post<boolean>({
      url: EndpointAction.batchDelete,
      data: { ids },
    });
    return response;
  },

  /**
   * 获取端点详情
   */
  async getEndpointDetail(id: string): Promise<Endpoint> {
    const response = await HttpRequest.get<Endpoint>({
      url: `${EndpointAction.detail}/${id}`,
    });

    return response;
  },

  /**
   * 测试端点
   */
  async testEndpoint(request: EndpointTestRequest): Promise<EndpointTestResponse> {
    const response = await HttpRequest.post<EndpointTestResponse>({
      url: EndpointAction.test,
      data: request,
    });
    return response;
  },

  /**
   * 验证端点配置
   */
  async validateConfig(endpointType: string, config: any): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await HttpRequest.post<{ valid: boolean; errors?: string[] }>({
      url: EndpointAction.validateConfig,
      data: {
        endpointType,
        config,
      },
    });
    return response;
  },

  /**
   * 导出端点配置
   */
  async exportConfig(id: string, name: string): Promise<void> {
    const response = await HttpRequest.postDownload<Blob>({
      url: `${EndpointAction.exportConfig}/${id}`,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name}_endpoint.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * 导入端点配置
   */
  async importConfig(file: File): Promise<Endpoint> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await HttpRequest.post<Endpoint>({
      url: EndpointAction.importConfig,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  /**
   * 获取端点配置Schema
   */
  async getConfigSchema(endpointType: string): Promise<EndpointConfigSchema> {
    const response = await HttpRequest.get<EndpointConfigSchema>(
      {
        url: EndpointAction.getConfigSchema,
        params: { endpointType },
      },
      { successMessageMode: 'none' }
    );
    return response;
  },
};
