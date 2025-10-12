import { HttpRequest } from '@/utils/request';
import type { PageQueryParams } from '@/types/global';

/**
 * 组件类型选项
 */
export const COMPONENT_TYPE_OPTIONS = [
  { value: 'Input', label: '输入框' },
  { value: 'InputPassword', label: '密码输入框' },
  { value: 'InputNumber', label: '数字输入框' },
  { value: 'TextArea', label: '文本域' },
  { value: 'Select', label: '下拉选择' },
  { value: 'Radio', label: '单选框' },
  { value: 'Switch', label: '开关' },
  { value: 'DatePicker', label: '日期选择器' },
] as const;

/**
 * 作用模式选项
 */
export const MODE_OPTIONS = [
  { value: 'IN_OUT', label: 'IN_OUT' },
  { value: 'IN', label: 'IN' },
  { value: 'OUT', label: 'OUT' },
  { value: 'OUT_IN', label: 'OUT_IN' },
] as const;
/**
 * Schema字段配置
 */
export interface SchemaField {
  /** 唯一标识 */
  id?: string;
  /** 字段名 */
  field: string;
  /** 字段标签 */
  label: string;
  /** 组件类型 */
  component: string;
  /** 是否必填 */
  required?: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 组件属性配置 */
  properties?: any;
  /** 组件属性(JSON字符串) - 兼容旧版本 */
  componentProps?: string;
  /** 验证规则(JSON字符串) */
  rules?: string;
  /** 显示条件(JS表达式) */
  showCondition?: string;
  /** 排序号 */
  sortOrder?: number;
  /** 作用模式 */
  mode: string;
  /** 说明 */
  description?: string;
}

/**
 * 端点类型配置
 */
export interface EndpointTypeConfig {
  /** 配置ID */
  id: string;
  /** 端点类型 */
  endpointType: string;
  /** 端点类型名称 */
  typeName: string;
  /** 端点类型编码 */
  typeCode: string;
  /** 图标 */
  icon?: string;
  support_mode: string[];
  /** 描述 */
  description?: string;
  /** Schema版本 */
  schemaVersion: string;
  /** Schema字段列表 */
  schemaFields: SchemaField[];
  /** 状态 */
  status: boolean;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 创建人 */
  createBy?: string;
  /** 更新人 */
  updateBy?: string;
}

/**
 * 端点类型列表项
 */
export interface EndpointTypeListItem {
  id: string;
  endpointType: string;
  typeName: string;
  typeCode: string;
  icon?: string;
  description?: string;
  schemaVersion: string;
  fieldCount: number;
  status: boolean;
  createTime?: string;
  updateTime?: string;
}

/**
 * 端点类型搜索参数
 */
export interface EndpointTypeSearchParams extends PageQueryParams {
  typeName?: string;
  typeCode?: string;
  status?: boolean;
}

/**
 * 端点类型表单数据
 */
export interface EndpointTypeFormData {
  id?: string;
  endpointType: string;
  typeName: string;
  typeCode: string;
  icon?: string;
  description?: string;
  schemaVersion?: string;
  schemaFields: SchemaField[];
  status?: boolean;
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  totalRow?: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 端点配置API路径
 */
enum EndpointConfigAction {
  list = '/integrated/endpointConfig/list',
  add = '/integrated/endpointConfig/add',
  update = '/integrated/endpointConfig/update',
  delete = '/integrated/endpointConfig/delete',
  detail = '/integrated/endpointConfig/detail',
  validateSchema = '/integrated/endpointConfig/validateSchema',
  exportSchema = '/integrated/endpointConfig/exportSchema',
  importSchema = '/integrated/endpointConfig/importSchema',
}

/**
 * 端点配置服务
 */
export const endpointConfigService = {
  /**
   * 分页查询端点类型配置列表
   */
  async getEndpointTypeList(
    params: EndpointTypeSearchParams
  ): Promise<PageResult<EndpointTypeListItem>> {
    const response = await HttpRequest.post<PageResult<EndpointTypeListItem>>(
      {
        url: EndpointConfigAction.list,
        data: params,
      },
      { successMessageMode: 'none' }
    );
    return response;
  },

  /**
   * 获取端点类型配置详情
   */
  async getEndpointTypeDetail(id: string): Promise<EndpointTypeConfig> {
    const response = await HttpRequest.get<EndpointTypeConfig>({
      url: `${EndpointConfigAction.detail}/${id}`,
    }, { successMessageMode: 'none' });
    return response;
  },

  /**
   * 新增端点类型配置
   */
  async addEndpointType(data: EndpointTypeFormData): Promise<EndpointTypeConfig> {
    const response = await HttpRequest.post<EndpointTypeConfig>({
      url: EndpointConfigAction.add,
      data,
    });
    return response;
  },

  /**
   * 更新端点类型配置
   */
  async updateEndpointType(data: EndpointTypeFormData): Promise<EndpointTypeConfig> {
    const response = await HttpRequest.post<EndpointTypeConfig>({
      url: EndpointConfigAction.update,
      data,
    });
    return response;
  },

  /**
   * 删除端点类型配置
   */
  async deleteEndpointType(id: string): Promise<boolean> {
    const response = await HttpRequest.post<boolean>({
      url: EndpointConfigAction.delete,
      data: { id },
    });
    return response;
  },

  /**
   * 验证Schema配置
   */
  async validateSchema(schemaFields: SchemaField[]): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await HttpRequest.post<{ valid: boolean; errors?: string[] }>({
      url: EndpointConfigAction.validateSchema,
      data: { schemaFields },
    });
    return response;
  },

  /**
   * 导出Schema配置
   */
  async exportSchema(id: string, typeName: string): Promise<void> {
    const response = await HttpRequest.postDownload<Blob>({
      url: `${EndpointConfigAction.exportSchema}/${id}`,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${typeName}_schema.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * 导入Schema配置
   */
  async importSchema(file: File): Promise<SchemaField[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await HttpRequest.post<SchemaField[]>({
      url: EndpointConfigAction.importSchema,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};

