import type { PaginationProps, TableColumnsType } from 'antd';
import type { CSSProperties } from 'react';

/**
 * 表格列配置
 */
export interface TableColumnConfig<T = any> extends Omit<TableColumnsType<T>[0], 'dataIndex'> {
  /** 数据字段名 */
  dataIndex: string;
  /** 是否用于搜索匹配 */
  searchable?: boolean;
  /** 是否用于显示在输入框中 */
  displayable?: boolean;
}

/**
 * 样式配置
 */
export interface StyleConfig {
  /** 输入框样式 */
  input?: CSSProperties;
  /** 下拉层样式 */
  dropdown?: CSSProperties;
  /** 表格样式 */
  table?: CSSProperties;
}

/**
 * 类名配置
 */
export interface ClassNameConfig {
  /** 输入框类名 */
  input?: string;
  /** 下拉层类名 */
  dropdown?: string;
  /** 表格类名 */
  table?: string;
}

/**
 * 表格选择器组件属性
 */
export interface TableSelectProps<T = any> {
  /** 组件唯一ID */
  id: string;
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否允许清空 */
  allowClear?: boolean;
  /** 样式配置 */
  styles?: StyleConfig;
  /** 类名配置 */
  classNames?: ClassNameConfig;
  /** 下拉层宽度 */
  dropdownWidth?: number;
  /** 下拉层高度 */
  dropdownHeight?: number;
  /** 表格分页配置 */
  pagination?: false | PaginationProps;
  /** 显示字段（用于在输入框中显示选中项的值） */
  displayField: string;
  /** 唯一标识字段 */
  keyField: string;
  /** 数据获取函数 */
  dataSource: (id: string) => Promise<{ columns: TableColumnConfig<T>[]; data: T[] }>;
  /** 选中值 */
  value?: T;
  /** 值变化回调 */
  onChange?: (value: T | undefined) => void;
  /** 选中行变化回调 */
  onSelect?: (record: T, selectedRows: T[], info: { type: 'click' | 'keyboard' }) => void;
  /** 搜索变化回调 */
  onSearch?: (value: string) => void;
  /** 自定义渲染选中项显示内容（用于表格显示，不影响输入框） */
  renderDisplayValue?: (record: T) => React.ReactNode;
  /** 自定义格式化输入框显示值 */
  displayValueFormatter?: (record: T) => string;
  /** 自定义渲染表格行 */
  renderRow?: (record: T, index: number) => React.ReactNode;
  /** 自定义过滤器 */
  customFilter?: (record: T, searchValue: string) => boolean;
}

/**
 * 表格选择器内部状态
 */
export interface TableSelectState<T = any> {
  /** 是否打开下拉层 */
  open: boolean;
  /** 搜索关键词 */
  searchValue: string;
  /** 过滤后的数据 */
  filteredData: T[];
  /** 当前选中的行索引 */
  selectedRowIndex: number;
  /** 是否正在加载数据 */
  loading: boolean;
  /** 原始数据 */
  rawData: T[];
  /** 表格列配置 */
  columns: TableColumnConfig<T>[];
}
