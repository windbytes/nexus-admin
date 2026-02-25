import type { DataNode } from 'antd/es/tree';

/** 工具栏控件类型：按钮、下拉、选择、复选框、数字输入 */
export type ToolItemType = 'button' | 'dropdown' | 'select' | 'checkbox' | 'inputNumber';

/** Select 选项 */
export interface ToolSelectOption {
  value: string;
  label: string;
}

/** 单工具项配置（支持多种控件类型，与 WPS 工具栏一致） */
export interface ToolItemConfig {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** 控件类型，默认 button */
  type?: ToolItemType;
  /** 点击/变更时执行的命令名 */
  command?: string;
  /** 行索引，rows=2 时用于分配到第 1 行或第 2 行，0 或 1 */
  rowIndex?: 0 | 1;
  // --- Dropdown ---
  /** 自定义下拉内容渲染 */
  dropdownRender?: () => React.ReactNode;
  // --- Select ---
  options?: ToolSelectOption[];
  value?: string;
  // --- Checkbox ---
  checked?: boolean;
  // --- InputNumber ---
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

/** 仅 key/label/icon 的扁平工具项 */
export interface TabToolItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

/** 工具栏分组配置（组间竖线分隔，组内可 1 行或 2 行） */
export interface ToolGroupConfig {
  key?: string;
  label?: string;
  /** 组内占 1 行或 2 行 */
  rows?: 1 | 2;
  tools: ToolItemConfig[];
}

/** 插件贡献的工具栏内容 */
export interface ToolbarContribution {
  groups: ToolGroupConfig[];
}

/** 单个 Tab 配置（如：开始、页面、插入等，不含文件） */
export interface TabItemConfig {
  key: string;
  label: string;
  /** 兼容：扁平工具列表，无 groups 时使用 */
  tools?: TabToolItem[];
  /** 分组工具列表，优先于 tools */
  groups?: ToolGroupConfig[];
}

/** 文件下拉菜单项（支持二级子菜单） */
export interface FileMenuItem {
  key: string;
  label: string;
  /** 二级菜单 */
  children?: FileMenuItem[];
  icon?: React.ReactNode;
}

/** 文件菜单配置项：普通菜单项或分组分隔线 */
export type FileMenuConfigItem = FileMenuItem | { type: 'divider' };

/** 左侧快捷操作按钮配置 */
export interface LeftQuickActionConfig {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

/** 左侧模板树节点（扩展 Ant Design Tree DataNode） */
export interface TemplateTreeNode extends DataNode {
  key: string;
  title: string;
  children?: TemplateTreeNode[];
  /** 是否为模板节点（叶子为模板，非叶子为分类） */
  isTemplate?: boolean;
}
