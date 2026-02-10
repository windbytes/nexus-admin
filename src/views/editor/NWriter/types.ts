/**
 * 病历编辑器模块类型定义
 */

import type { DataNode } from 'antd/es/tree';

/** Tab 项下的单个工具按钮 */
export interface TabToolItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

/** 单个 Tab 配置（如：开始、页面、插入等，不含文件） */
export interface TabItemConfig {
  key: string;
  label: string;
  tools: TabToolItem[];
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
