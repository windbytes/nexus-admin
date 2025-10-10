import type { PageQueryParams } from '@/types/global';
import { HttpRequest } from '@/utils/request';

/**
 * Web服务（WSDL）信息
 */
export interface WebService {
  /** Web服务唯一标识符 */
  id: string;
  
  /** Web服务名称 */
  name: string;
  
  /** Web服务编码 */
  code: string;
  
  /** 描述信息 */
  description?: string;
  
  /** 录入方式：manual-图形化编辑，file-上传文件，url-URL获取 */
  inputType: 'manual' | 'file' | 'url';
  
  /** WSDL命名空间 */
  namespace?: string;
  
  /** 服务注解/描述 */
  serviceAnnotation?: string;
  
  /** 操作列表 */
  operations?: WsdlOperation[];
  
  /** WSDL文件信息（仅当inputType为file时） */
  fileInfo?: {
    /** 原始文件名 */
    fileName: string;
    /** 文件大小（字节） */
    fileSize: number;
    /** 文件上传时间 */
    uploadTime?: string;
  };
  
  /** WSDL URL（仅当inputType为url时） */
  wsdlUrl?: string;
  
  /** 完整的WSDL内容（XML格式） */
  wsdlContent?: string;
  
  /** 启用状态 */
  status: boolean;
  
  /** 分类 */
  category?: string;
  
  /** 标签 */
  tags?: string[];
  
  /** 创建时间 */
  createTime?: string;
  
  /** 更新时间 */
  updateTime?: string;
  
  /** 创建者 */
  createBy?: string;
  
  /** 更新者 */
  updateBy?: string;
  
  /** 备注 */
  remark?: string;
}

/**
 * WSDL操作定义
 */
export interface WsdlOperation {
  /** 操作ID（临时ID） */
  id?: string;
  
  /** 操作名称 */
  name: string;
  
  /** 操作注解/描述 */
  annotation?: string;
  
  /** 输入参数 */
  inputParameters?: WsdlParameter[];
  
  /** 输出参数 */
  outputParameters?: WsdlParameter[];
}

/**
 * WSDL参数定义
 */
export interface WsdlParameter {
  /** 参数ID（临时ID） */
  id?: string;
  
  /** 参数名称 */
  name: string;
  
  /** 参数类型 */
  type: string;
  
  /** 是否必填 */
  required?: boolean;
  
  /** 参数描述 */
  description?: string;
}

/**
 * Web服务搜索参数
 */
export interface WebServiceSearchParams extends PageQueryParams{
  /** 服务名称（模糊搜索） */
  name?: string;
  
  /** 服务编码（模糊搜索） */
  code?: string;
  
  /** 录入方式筛选 */
  inputType?: 'manual' | 'file' | 'url';
  
  /** 分类筛选 */
  category?: string;
  
  /** 状态筛选 */
  status?: boolean;
}

/**
 * Web服务表单数据
 */
export interface WebServiceFormData {
  /** 服务ID（编辑时必填） */
  id?: string;
  
  /** 服务名称 */
  name: string;
  
  /** 服务编码 */
  code: string;
  
  /** 描述信息 */
  description?: string;
  
  /** 录入方式 */
  inputType: 'manual' | 'file' | 'url';
  
  /** WSDL命名空间（手动录入时） */
  namespace?: string;
  
  /** 服务注解（手动录入时） */
  serviceAnnotation?: string;
  
  /** 操作列表（手动录入时） */
  operations?: WsdlOperation[];
  
  /** WSDL文件（文件上传时） */
  file?: File;
  
  /** WSDL URL（URL获取时） */
  wsdlUrl?: string;
  
  /** 完整的WSDL内容 */
  wsdlContent?: string;
  
  /** 启用状态 */
  status?: boolean;
  
  /** 分类 */
  category?: string;
  
  /** 标签 */
  tags?: string[];
  
  /** 备注 */
  remark?: string;
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  /** 数据记录列表 */
  records: T[];
  
  /** 总记录数 */
  total: number;
  
  /** 当前页码 */
  pageNum: number;
  
  /** 每页数量 */
  pageSize: number;
}

/**
 * Web服务分类
 */
export const WEB_SERVICE_CATEGORIES = [
  { value: 'soap', label: 'SOAP服务' },
  { value: 'rest', label: 'REST服务' },
  { value: 'integration', label: '集成服务' },
  { value: 'business', label: '业务服务' },
  { value: 'custom', label: '自定义' },
  { value: 'other', label: '其他' },
];

/**
 * 参数类型选项
 */
export const PARAMETER_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'int', label: 'Integer' },
  { value: 'long', label: 'Long' },
  { value: 'double', label: 'Double' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'DateTime' },
  { value: 'array', label: 'Array' },
  { value: 'object', label: 'Object' },
  { value: 'custom', label: '自定义类型' },
];

/**
 * Web服务API路径
 */
enum WebServiceAction {
  list = '/resource/webservice/list',
  add = '/resource/webservice/add',
  update = '/resource/webservice/update',
  delete = '/resource/webservice/delete',
  batchDelete = '/resource/webservice/batchDelete',
  detail = '/resource/webservice/detail',
  uploadWsdl = '/resource/webservice/uploadWsdl',
  parseWsdlFromUrl = '/resource/webservice/parseWsdlFromUrl',
  validateWsdl = '/resource/webservice/validateWsdl',
  exportWsdl = '/resource/webservice/exportWsdl',
}

/**
 * Web服务API服务
 */
export const webServiceApi = {
  /**
   * 分页查询Web服务列表
   */
  async getWebServiceList(params: WebServiceSearchParams): Promise<PageResult<WebService>> {
    const response = await HttpRequest.post<PageResult<WebService>>({
      url: WebServiceAction.list,
      data: params,
    }, {successMessageMode: 'none'});
    return response;
  },

  /**
   * 新增Web服务
   */
  async addWebService(data: WebServiceFormData): Promise<WebService> {
    // 如果是文件上传模式，需要使用FormData
    if (data.inputType === 'file' && data.file) {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('name', data.name);
      formData.append('code', data.code);
      if (data.description) formData.append('description', data.description);
      if (data.category) formData.append('category', data.category);
      if (data.status !== undefined) formData.append('status', String(data.status));
      if (data.remark) formData.append('remark', data.remark);
      if (data.tags) formData.append('tags', JSON.stringify(data.tags));

      const response = await HttpRequest.post<WebService>({
        url: WebServiceAction.add,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    }

    // 普通模式
    const response = await HttpRequest.post<WebService>({
      url: WebServiceAction.add,
      data,
    });
    return response;
  },

  /**
   * 更新Web服务
   */
  async updateWebService(data: WebServiceFormData): Promise<WebService> {
    // 如果是文件上传模式，需要使用FormData
    if (data.inputType === 'file' && data.file) {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('id', data.id || '');
      formData.append('name', data.name);
      formData.append('code', data.code);
      if (data.description) formData.append('description', data.description);
      if (data.category) formData.append('category', data.category);
      if (data.status !== undefined) formData.append('status', String(data.status));
      if (data.remark) formData.append('remark', data.remark);
      if (data.tags) formData.append('tags', JSON.stringify(data.tags));

      const response = await HttpRequest.post<WebService>({
        url: WebServiceAction.update,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    }

    // 普通模式
    const response = await HttpRequest.post<WebService>({
      url: WebServiceAction.update,
      data,
    });
    return response;
  },

  /**
   * 删除Web服务
   */
  async deleteWebService(id: string): Promise<boolean> {
    const response = await HttpRequest.post<boolean>({
      url: WebServiceAction.delete,
      data: { id },
    });
    return response;
  },

  /**
   * 批量删除Web服务
   */
  async batchDeleteWebService(ids: string[]): Promise<boolean> {
    const response = await HttpRequest.post<boolean>({
      url: WebServiceAction.batchDelete,
      data: { ids },
    });
    return response;
  },

  /**
   * 获取Web服务详情
   */
  async getWebServiceDetail(id: string): Promise<WebService> {
    const response = await HttpRequest.get<WebService>({
      url: `${WebServiceAction.detail}/${id}`,
    });
    return response;
  },

  /**
   * 上传并解析WSDL文件
   */
  async uploadWsdl(file: File): Promise<{ wsdlContent: string; operations: WsdlOperation[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await HttpRequest.post<{ wsdlContent: string; operations: WsdlOperation[] }>({
      url: WebServiceAction.uploadWsdl,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  /**
   * 从URL解析WSDL
   */
  async parseWsdlFromUrl(url: string): Promise<{ wsdlContent: string; operations: WsdlOperation[] }> {
    const response = await HttpRequest.post<{ wsdlContent: string; operations: WsdlOperation[] }>({
      url: WebServiceAction.parseWsdlFromUrl,
      data: { url },
    });
    return response;
  },

  /**
   * 验证WSDL内容
   */
  async validateWsdl(wsdlContent: string): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await HttpRequest.post<{ valid: boolean; errors?: string[] }>({
      url: WebServiceAction.validateWsdl,
      data: { wsdlContent },
    });
    return response;
  },

  /**
   * 导出WSDL文件
   */
  async exportWsdl(id: string, name: string): Promise<void> {
    const response = await HttpRequest.get<Blob>({
      url: `${WebServiceAction.exportWsdl}/${id}`,
      responseType: 'blob',
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name}.wsdl`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

