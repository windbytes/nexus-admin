/**
 * Engine 端点管理 API
 * 与后端 EndpointController 路径及请求方法一致：GET 分页/详情/导出/config-schema，POST 新增/更新/删除/批量删除/测试/校验/导入
 */
import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type {
  Endpoint,
  EndpointConfig,
  EndpointConfigSchema,
  EndpointSearchParams,
  EndpointTestRequest,
  EndpointTestResponse,
  EndpointValidateResult,
} from './types';

/** 端点接口路径（与后端 @RequestMapping + @PostMapping/@GetMapping 一致） */
const EndpointsApi = {
  list: '/engine/endpoints',
  getById: (id: string) => `/engine/endpoints/${id}`,
  create: '/engine/endpoints/create',
  update: (id: string) => `/engine/endpoints/update/${id}`,
  delete: (id: string) => `/engine/endpoints/delete/${id}`,
  batchDelete: '/engine/endpoints/batch',
  test: '/engine/endpoints/test',
  validate: '/engine/endpoints/validate',
  export: (id: string) => `/engine/endpoints/export/${id}`,
  import: '/engine/endpoints/import',
  configSchema: '/engine/endpoints/config-schema',
  configSchemaList: '/engine/endpoints/config-schemas',
};

/** 端点类型配置接口路径（若后端有独立 Controller 可与此一致） */
const EndpointConfigsApi = {
  list: '/engine/endpoint-configs',
  getById: (id: string) => `/engine/endpoint-configs/${id}`,
  create: '/engine/endpoint-configs',
  update: (id: string) => `/engine/endpoint-configs/${id}`,
  delete: (id: string) => `/engine/endpoint-configs/${id}`,
};

export const endpointService = {
  /**
   * 分页查询端点列表
   * @param params 查询参数（含 name、endpointType、category、status、pageNum、pageSize 等）
   * @returns 分页结果
   */
  async getEndpointList(params: EndpointSearchParams): Promise<PageResult<Endpoint>> {
    return HttpRequest.get<PageResult<Endpoint>>({ url: EndpointsApi.list, params }, { successMessageMode: 'none' });
  },

  /**
   * 根据 ID 查询端点详情
   * @param id 端点 ID（后端 Long 序列化为字符串）
   * @returns 端点实体，不存在时由后端抛异常
   */
  async getById(id: string): Promise<Endpoint | null> {
    return HttpRequest.get<Endpoint>({ url: EndpointsApi.getById(id) }, { successMessageMode: 'none' });
  },

  /**
   * 新增端点
   * @param endpoint 端点数据（无需传 id）
   * @returns 保存后的端点（含生成 id）
   */
  async addEndpoint(endpoint: Partial<Endpoint>): Promise<Endpoint> {
    return HttpRequest.post<Endpoint>({ url: EndpointsApi.create, data: endpoint });
  },

  /**
   * 更新端点
   * @param id 端点 ID
   * @param endpoint 端点数据（id 会以路径参数为准）
   * @returns 更新后的端点
   */
  async updateEndpoint(id: string, endpoint: Partial<Endpoint>): Promise<Endpoint> {
    return HttpRequest.post<Endpoint>({ url: EndpointsApi.update(id), data: { ...endpoint, id } });
  },

  /**
   * 删除端点（逻辑删除）
   * @param id 端点 ID
   */
  async deleteEndpoint(id: string): Promise<void> {
    await HttpRequest.post<void>({ url: EndpointsApi.delete(id) });
  },

  /**
   * 批量删除端点
   * @param ids 端点 ID 列表（后端接收 List<Long>，前端传数字数组）
   * @returns 实际删除条数
   */
  async batchDelete(ids: string[]): Promise<number> {
    const numericIds = ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
    return HttpRequest.post<number>({ url: EndpointsApi.batchDelete, data: numericIds });
  },

  /**
   * 测试端点连接（POST /engine/endpoints/test）
   * @param request 测试请求（端点类型、配置、可选端点 ID）
   * @returns 测试结果（success、error、executionTime 等）
   */
  async testEndpoint(request: EndpointTestRequest): Promise<EndpointTestResponse> {
    return HttpRequest.post<EndpointTestResponse>({ url: EndpointsApi.test, data: request });
  },

  /**
   * 校验端点配置是否合法（POST /engine/endpoints/validate）
   * @param endpointType 端点类型
   * @param config 配置对象
   * @returns 校验结果（valid、errors）
   */
  async validateConfig(
    endpointType: string,
    config: Record<string, unknown>
  ): Promise<EndpointValidateResult> {
    return HttpRequest.post<EndpointValidateResult>({
      url: EndpointsApi.validate,
      data: { endpointType, config },
    });
  },

  /**
   * 导出端点配置为 JSON 文件下载（GET /engine/endpoints/export/{id}）
   * @param id 端点 ID
   * @param name 建议文件名（不含后缀），用于 Content-Disposition
   */
  async exportConfig(id: string, name: string): Promise<void> {
    const response = await HttpRequest.getDownload<Blob>({
      url: EndpointsApi.export(id),
      params: { name },
    });
    const url = window.URL.createObjectURL(response);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name}_endpoint.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * 从 JSON 文件导入端点（POST /engine/endpoints/import）
   * @param file 上传的 JSON 文件
   * @returns 导入后的端点实体
   */
  async importConfig(file: File): Promise<Endpoint> {
    const formData = new FormData();
    formData.append('file', file);
    return HttpRequest.post<Endpoint>({
      url: EndpointsApi.import,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * 按端点类型获取类型配置 Schema（GET /engine/endpoints/config-schema）
   * @param endpointType 端点类型（如 http、database）
   * @returns 该类型对应的配置（含 schemaFields），不存在时为 null
   */
  async getConfigSchema(endpointType: string): Promise<EndpointConfigSchema | EndpointConfig | null> {
    return HttpRequest.get<EndpointConfigSchema | null>(
      { url: EndpointsApi.configSchema, params: { endpointType } },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 分页查询端点类型配置列表（GET /engine/endpoints/config-schemas）
   * @param params pageNum、pageSize、status（可选，仅启用）
   * @returns 分页结果，records 为 EndpointConfig[]
   */
  async getConfigSchemaList(params: {
    pageNum?: number;
    pageSize?: number;
    status?: boolean;
  }): Promise<PageResult<EndpointConfig>> {
    return HttpRequest.get<PageResult<EndpointConfig>>(
      { url: EndpointsApi.configSchemaList, params },
      { successMessageMode: 'none' }
    );
  },
};

export const endpointConfigService = {
  /**
   * 分页查询端点类型配置列表
   * @param endpointType 端点类型筛选
   * @param page 页码
   * @param size 每页条数
   */
  async list(endpointType?: string, page = 1, size = 20): Promise<PageResult<EndpointConfig>> {
    const params: Record<string, unknown> = { page, size };
    if (endpointType) {
      params['endpointType'] = endpointType;
    }
    return HttpRequest.get<PageResult<EndpointConfig>>(
      { url: EndpointConfigsApi.list, params },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 根据 ID 查询端点类型配置详情
   * @param id 配置 ID
   */
  async getById(id: string): Promise<EndpointConfig | null> {
    return HttpRequest.get<EndpointConfig>({ url: EndpointConfigsApi.getById(id) }, { successMessageMode: 'none' });
  },

  /**
   * 新增端点类型配置
   * @param config 配置数据
   */
  async create(config: Partial<EndpointConfig>): Promise<EndpointConfig> {
    return HttpRequest.post<EndpointConfig>({ url: EndpointConfigsApi.create, data: config });
  },

  /**
   * 更新端点类型配置
   * @param id 配置 ID
   * @param config 配置数据
   */
  async update(id: string, config: Partial<EndpointConfig>): Promise<EndpointConfig> {
    return HttpRequest.put<EndpointConfig>({ url: EndpointConfigsApi.update(id), data: { ...config, id } });
  },

  /**
   * 删除端点类型配置
   * @param id 配置 ID
   */
  async delete(id: string): Promise<void> {
    await HttpRequest.delete({ url: EndpointConfigsApi.delete(id) });
  },
};
