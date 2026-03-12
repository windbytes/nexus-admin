import type { Endpoint, EndpointTypeConfig, SchemaField } from '@/services/engine/endpoint/types';

/**
 * 端点弹窗组件 Props
 */
export interface EndpointModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 弹窗标题 */
  title: string;
  /** 加载状态 */
  loading: boolean;
  /** 初始值 */
  initialValues?: Partial<Endpoint> | undefined;
  /** 是否查看模式 */
  isViewMode?: boolean;
  /** 确认回调 */
  onOk: (values: any) => void;
  /** 取消回调 */
  onCancel: () => void;
}

/**
 * 键值对接口
 */
export interface KeyValuePair {
  key: string;
  value: string;
  id: string;
}

/**
 * 可收缩卡片组件 Props
 */
export interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

/**
 * 端点类型配置 Hook 返回值
 */
export interface UseEndpointTypeConfigReturn {
  /** 端点类型选项 */
  endpointTypeOptions: Array<{ value: string; label: string; config: EndpointTypeConfig }>;
  /** 模式选项 */
  modeOptions: Array<{ value: string; label: string }>;
  /** 选中的端点类型配置 */
  selectedEndpointTypeConfig: EndpointTypeConfig | null;
  /** Schema 字段列表 */
  schemaFields: SchemaField[];
  /** 类型列表加载状态 */
  typeListLoading: boolean;
}

/**
 * 端点表单 Hook 返回值
 */
export interface UseEndpointFormReturn {
  /** 表单值 */
  formValues: Record<string, any>;
  /** 处理表单值变化 */
  handleValuesChange: (changedValues: any, allValues: any) => void;
  /** 处理确定提交 */
  handleOk: (schemaFields?: Array<{ field: string }>) => Promise<void>;
  /** 端点类型名称 */
  endpointTypeName: string | undefined;
  /** 选中的模式 */
  selectedMode: string | undefined;
  /** 是否启用指数退避 */
  useExponentialBackoff: boolean | undefined;
}

/**
 * 测试 Tab Hook 返回值
 */
export interface UseTestTabReturn {
  /** 请求头列表 */
  headers: KeyValuePair[];
  /** 主体内容 */
  bodyContent: string;
  /** 请求内容 */
  requestContent: string;
  /** 响应内容 */
  responseContent: string;
  /** 添加请求头 */
  handleAddHeader: () => void;
  /** 更新请求头 */
  handleHeaderChange: (id: string, field: 'key' | 'value', value: string) => void;
  /** 删除请求头 */
  handleRemoveHeader: (id: string) => void;
  /** 设置主体内容 */
  setBodyContent: (value: string) => void;
  /** 设置请求内容 */
  setRequestContent: (value: string) => void;
  /** 设置响应内容 */
  setResponseContent: (value: string) => void;
}
