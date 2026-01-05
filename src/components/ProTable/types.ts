import type { CardProps, TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { ReactNode } from 'react';

/**
 * 表格列配置
 */
export interface ProColumnType<T = unknown> extends Omit<ColumnType<T>, 'children'> {
  /** 是否在列设置中隐藏 */
  hideInSetting?: boolean;
  /** 是否默认隐藏列 */
  defaultHidden?: boolean;
  /** 是否可以拖拽 */
  draggable?: boolean;
  /** 子列 */
  children?: ProColumnType<T>[];
}

/**
 * 表格密度
 */
export type TableDensity = 'large' | 'middle' | 'small';

/**
 * 列固定位置
 */
export type ColumnFixed = 'left' | 'right' | false;

/**
 * 列配置项
 */
export interface ColumnSetting {
  /** 列的 key */
  key: string;
  /** 列标题 */
  title: ReactNode;
  /** 是否显示 */
  show: boolean;
  /** 固定位置 */
  fixed?: ColumnFixed;
  /** 排序 */
  order: number;
  /** 是否禁用（不可拖拽、不可隐藏） */
  disabled?: boolean;
}

/**
 * ProTable 组件属性
 */
export interface ProTableProps<T = unknown> extends Omit<TableProps<T>, 'columns' | 'title'> {
  /** 卡片是否边框 */
  cardVariant?: CardProps['variant'];
  /** 表格列配置 */
  columns: ProColumnType<T>[];
  /** 表格标题 */
  title?: ReactNode;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 操作栏按钮 */
  actionButtons?: ReactNode;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 列配置变化回调 */
  onColumnSettingChange?: (settings: ColumnSetting[]) => void;
  /** 初始列配置（用于持久化） */
  initialColumnSettings?: ColumnSetting[];
  /** Card 样式类名 */
  cardClassNames?: {
    root?: string;
    body?: string;
    table?: {
      container?: string;
      root?: string;
    };
  };
  /** 工具栏额外内容 */
  toolbarExtra?: ReactNode;
}

/**
 * 工具栏属性
 */
export interface ToolbarProps {
  /** 标题 */
  title?: ReactNode;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 操作栏按钮 */
  actionButtons?: ReactNode;
  /** 选中行的数据 */
  selectedRowKeys?: React.Key[];
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 当前密度 */
  density?: TableDensity;
  /** 密度变化回调 */
  onDensityChange?: (density: TableDensity) => void;
  /** 是否显示列设置 */
  showColumnSetting?: boolean;
  /** 列配置 */
  columnSettings?: ColumnSetting[];
  /** 列配置变化回调 */
  onColumnSettingChange?: (settings: ColumnSetting[]) => void;
  /** 重置回调 */
  onReset?: () => void;
  /** 额外内容 */
  extra?: ReactNode;
}

/**
 * 列设置面板属性
 */
export interface ColumnSettingProps {
  /** 列配置 */
  columns: ColumnSetting[];
  /** 列配置变化回调 */
  onChange: (settings: ColumnSetting[]) => void;
  /** 重置回调 */
  onReset?: () => void;
}
