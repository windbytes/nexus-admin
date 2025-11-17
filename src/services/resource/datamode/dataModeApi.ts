import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';

/**
 * JSON数据模式信息
 */
export interface JsonDataMode {
  /** 数据模式唯一标识符 */
  id: string;

  /** 数据模式显示名称 */
  name: string;

  /** 数据模式编码，用于程序内部引用 */
  code: string;

  /** 数据模式描述信息 */
  description?: string;

  /** 数据来源类型：database-数据库查询，json-JSON文本，file-文件上传 */
  dataSource: 'database' | 'json' | 'file';

  /** 关联的端点ID（仅当dataSource为database时有效） */
  endpointId?: string;

  /** 端点显示名称（仅当dataSource为database时有效） */
  endpointName?: string;

  /** 原始JSON数据（仅当dataSource为json时有效） */
  sourceJson?: string;

  /** JSON Schema定义内容 */
  schemaJson: string;

  /** Schema版本号 */
  schemaVersion: string;

  /** Schema中定义的字段数量 */
  fields: number;

  /** 启用状态：true-启用，false-禁用 */
  status: boolean;

  /** 数据模式分类：api-API接口，database-数据库表，message-消息队列，file-文件数据，custom-自定义，other-其他 */
  category?: string;

  /** 标签数组，用于多维度分类和搜索 */
  tags?: string[];

  /** 创建时间 */
  createTime?: string;

  /** 最后更新时间 */
  updateTime?: string;

  /** 创建者 */
  createBy?: string;

  /** 最后更新者 */
  updateBy?: string;

  /** 备注信息 */
  remark?: string;
}

/**
 * 数据模式搜索参数
 */
export interface DataModeSearchParams {
  /** 模式名称（模糊搜索） */
  name?: string;

  /** 模式编码（模糊搜索） */
  code?: string;

  /** 分类筛选 */
  category?: string;

  /** 数据来源筛选 */
  dataSource?: 'database' | 'json' | 'file';

  /** 状态筛选 */
  status?: boolean;

  /** 页码 */
  pageNum: number;

  /** 每页数量 */
  pageSize: number;
}

/**
 * 数据模式表单数据
 */
export interface DataModeFormData {
  /** 数据模式ID（编辑时必填） */
  id?: string;

  /** 模式名称 */
  name: string;

  /** 模式编码 */
  code: string;

  /** 描述信息 */
  description?: string;

  /** 数据来源类型 */
  dataSource: 'database' | 'json' | 'file';

  /** 端点ID（仅当dataSource为database时有效） */
  endpointId?: string;

  /** 原始JSON数据（仅当dataSource为json时有效） */
  sourceJson?: string;

  /** JSON Schema定义内容 */
  schemaJson: string;

  /** Schema版本号 */
  schemaVersion?: string;

  /** 启用状态 */
  status?: boolean;

  /** 分类 */
  category?: string;

  /** 标签数组 */
  tags?: string[];

  /** 备注信息 */
  remark?: string;
}

/**
 * 端点信息（简化版）
 */
export interface EndpointInfo {
  /** 端点唯一标识符 */
  id: string;

  /** 端点名称 */
  name: string;

  /** 端点URL地址 */
  url?: string;

  /** 端点类型 */
  type?: string;

  /** 端点状态 */
  status?: boolean;
}

/**
 * 从JSON生成Schema的请求
 */
export interface GenerateSchemaRequest {
  /** JSON数据内容 */
  json: string;

  /** 可选的Schema名称 */
  name?: string;
}

/**
 * 从端点查询JSON的请求
 */
export interface QueryJsonFromEndpointRequest {
  /** 端点ID */
  endpointId: string;

  /** 查询参数（可选） */
  params?: Record<string, any>;
}

/**
 * 数据模式分类
 */
export const DATA_MODE_CATEGORIES = [
  { value: 'api', label: 'API接口' },
  { value: 'database', label: '数据库表' },
  { value: 'message', label: '消息队列' },
  { value: 'file', label: '文件数据' },
  { value: 'custom', label: '自定义' },
  { value: 'other', label: '其他' },
];

/**
 * 数据模式API路径
 */
enum DataModeAction {
  list = '/resource/datamode/list',
  add = '/resource/datamode/add',
  update = '/resource/datamode/update',
  delete = '/resource/datamode/delete',
  batchDelete = '/resource/datamode/batchDelete',
  detail = '/resource/datamode/detail',
  generateSchema = '/resource/datamode/generateSchema',
  queryJsonFromEndpoint = '/resource/datamode/queryJsonFromEndpoint',
  validateSchema = '/resource/datamode/validateSchema',
  exportSchema = '/resource/datamode/exportSchema',
  importSchema = '/resource/datamode/importSchema',
  getEndpoints = '/integrated/endpoint/list',
}

/**
 * JSON数据模式服务
 */
export const dataModeService = {
  /**
   * 分页查询数据模式列表
   */
  async getDataModeList(params: DataModeSearchParams): Promise<PageResult<JsonDataMode>> {
    const response = await HttpRequest.post<PageResult<JsonDataMode>>(
      {
        url: DataModeAction.list,
        data: params,
      },
      { successMessageMode: 'none' }
    );
    return response;
  },

  /**
   * 新增数据模式
   */
  async addDataMode(data: DataModeFormData): Promise<JsonDataMode> {
    const response = await HttpRequest.post<JsonDataMode>({
      url: DataModeAction.add,
      data,
    });
    return response;
  },

  /**
   * 更新数据模式
   */
  async updateDataMode(data: DataModeFormData): Promise<JsonDataMode> {
    const response = await HttpRequest.post<JsonDataMode>({
      url: DataModeAction.update,
      data,
    });
    return response;
  },

  /**
   * 删除数据模式
   */
  async deleteDataMode(id: string): Promise<boolean> {
    const response = await HttpRequest.post<boolean>({
      url: DataModeAction.delete,
      data: { id },
    });
    return response;
  },

  /**
   * 批量删除数据模式
   */
  async batchDeleteDataMode(ids: string[]): Promise<boolean> {
    const response = await HttpRequest.post<boolean>({
      url: DataModeAction.batchDelete,
      data: { ids },
    });
    return response;
  },

  /**
   * 获取数据模式详情
   */
  async getDataModeDetail(id: string): Promise<JsonDataMode> {
    const response = await HttpRequest.get<JsonDataMode>({
      url: `${DataModeAction.detail}/${id}`,
    });
    return response;
  },

  /**
   * 从JSON文本生成Schema
   */
  async generateSchemaFromJson(request: GenerateSchemaRequest): Promise<{ schema: string }> {
    const response = await HttpRequest.post<{ schema: string }>({
      url: DataModeAction.generateSchema,
      data: request,
    });
    return response;
  },

  /**
   * 从端点查询JSON数据
   */
  async queryJsonFromEndpoint(request: QueryJsonFromEndpointRequest): Promise<{ json: string; data: any }> {
    const response = await HttpRequest.post<{ json: string; data: any }>({
      url: DataModeAction.queryJsonFromEndpoint,
      data: request,
    });
    return response;
  },

  /**
   * 验证Schema是否有效
   */
  async validateSchema(schema: string): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await HttpRequest.post<{ valid: boolean; errors?: string[] }>({
      url: DataModeAction.validateSchema,
      data: { schema },
    });
    return response;
  },

  /**
   * 导出Schema文件
   */
  async exportSchema(id: string, name: string): Promise<void> {
    const response = await HttpRequest.postDownload<Blob>({
      url: `${DataModeAction.exportSchema}/${id}`,
      responseType: 'blob',
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name}_schema.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * 导入Schema文件
   */
  async importSchema(file: File): Promise<{ schema: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await HttpRequest.post<{ schema: string }>({
      url: DataModeAction.importSchema,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  /**
   * 获取端点列表（用于下拉选择）
   */
  async getEndpoints(params?: { name?: string; status?: boolean }): Promise<EndpointInfo[]> {
    const response = await HttpRequest.post<EndpointInfo[]>({
      url: DataModeAction.getEndpoints,
      data: { ...params, pageNum: 1, pageSize: 1000 },
    });
    return response;
  },
};
