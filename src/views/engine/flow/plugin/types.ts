/**
 * 工作流节点插件类型定义
 */
import type { ComponentType } from 'react';
import type { NodeEndpointCategory, WorkflowNodeData } from '../types';

export interface WorkflowNodePluginMeta {
  /** 插件唯一 ID，建议命名空间如 'workflow.default' */
  id: string;
  /** 显示名称 */
  name: string;
  /** 版本号 */
  version: string;
  description?: string;
  /** 图标：React 节点或 icon 类型名 */
  icon?: React.ReactNode | string;
  /** 端点大类：工具类型节点 / 与外部交互类型节点 */
  endpointCategory: NodeEndpointCategory;
}

/** 属性配置面板接收的 props */
export interface WorkflowNodeConfigPanelProps {
  nodeId: string;
  data: WorkflowNodeData;
  onChange: (data: Partial<WorkflowNodeData>) => void;
}

/** 画布节点组件接收的 props（与 React Flow NodeProps 对齐） */
export type WorkflowNodeComponentProps = {
  id: string;
  data: WorkflowNodeData;
  selected?: boolean;
  [key: string]: unknown;
};

export interface WorkflowNodePlugin {
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
