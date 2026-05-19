/**
 * 工作流节点插件类型定义
 */
import type { ComponentType } from 'react';
import type { NodeEndpointCategory, WorkflowNode, WorkflowNodeData } from '../types';

/** 插件可声明的右键菜单项配置 */
export interface ContextMenuItemConfig {
  /** 菜单项唯一 key */
  key: string;
  /** 菜单项显示文字 */
  label: string;
  /** 快捷键提示文字（仅展示，不绑定） */
  shortcut?: string;
  /** 是否在此项之后插入分隔线 */
  dividerAfter?: boolean;
  /** 动态判断是否显示，默认显示 */
  visible?: (node: WorkflowNode) => boolean;
  /** 动态判断是否禁用，默认启用 */
  disabled?: (node: WorkflowNode) => boolean;
}

/** 插件元信息 */
export interface WorkflowNodePluginMeta {
  /** 插件唯一 ID */
  id: string;
  /** 显示名称 */
  name: string;
  /** 版本号 */
  version: string;
  /** 描述信息 */
  description?: string;
  /** 图标：React 节点或 icon 类型名 */
  icon?: React.ReactNode | string;
  /** 端点大类 */
  endpointCategory: NodeEndpointCategory;
  /** 是否支持单节点运行（快捷声明，等价于内置「运行此步骤」菜单项） */
  runnable?: boolean;
  /** 插件自定义的右键菜单项（在通用菜单项之前插入） */
  contextMenuItems?: ContextMenuItemConfig[];
}

/** 属性配置面板接收的 props */
export interface WorkflowNodeConfigPanelProps {
  /** 当前编辑的节点 ID */
  nodeId: string;
  /** 当前节点 data */
  data: WorkflowNodeData;
  /** 更新节点 data 的回调 */
  onChange: (data: Partial<WorkflowNodeData>) => void;
}

/** 画布节点组件接收的 props（与 React Flow NodeProps 对齐） */
export type WorkflowNodeComponentProps = {
  id: string;
  data: WorkflowNodeData;
  selected?: boolean;
  [key: string]: unknown;
};

/** 完整的节点插件定义 */
export interface WorkflowNodePlugin {
  /** 插件元信息 */
  meta: WorkflowNodePluginMeta;
  /** 新建节点时的默认 data */
  defaultNodeData: Omit<WorkflowNodeData, 'pluginId'> & { pluginId: string };
  /** 画布上渲染的节点组件 */
  NodeComponent: ComponentType<WorkflowNodeComponentProps>;
  /** 右侧属性配置面板组件 */
  ConfigPanel: ComponentType<WorkflowNodeConfigPanelProps>;
}

/** 用于 React Flow nodeTypes 的节点组件类型 */
export type WorkflowNodeComponent = ComponentType<WorkflowNodeComponentProps>;
