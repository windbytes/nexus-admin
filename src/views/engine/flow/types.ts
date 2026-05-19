/**
 * 流程编排模块类型定义
 * 节点类型继承 @xyflow/react 的 Node，并扩展计划实现所需属性；与后端 Spring Boot 集成友好。
 */
import type { Edge, Node } from '@xyflow/react';

/** 节点端点大类：与后端 NodeCategory 一致 */
export type NodeEndpointCategory = 'TRIGGER' | 'PROCESSOR' | 'CONNECTOR' | 'CONTROL';

/** 画布坐标（flow 坐标系） */
export interface FlowPosition {
  x: number;
  y: number;
}

/**
 * 流程节点 data：继承 React Flow 的 data 约定，并扩展流程编排与后端集成所需字段。
 * 所有自定义节点（插件）的 data 均应包含 pluginId，其余为插件与后端可扩展属性。
 */
export interface WorkflowNodeData extends Record<string, unknown> {
  /** 插件类型 id，对应注册的 WorkflowNodePlugin.meta.id，用于渲染与属性配置 */
  pluginId?: string;
  /** 节点标题，用于画布展示与列表 */
  title?: string;
  /** 端点大类：工具类型节点 / 与外部交互类型节点 */
  endpointCategory?: NodeEndpointCategory;
  /** 节点描述，可选 */
  description?: string;
  /** 后端/插件可用的扩展属性 */
  [key: string]: unknown;
}

/**
 * 流程节点类型：继承 React Flow 的 Node<WorkflowNodeData>，并约束 type / data。
 * 拥有 Node 的全部能力（id, position, selected, draggable, extent, parentId 等），
 * 同时约定 type 为插件 id、data 为 WorkflowNodeData，便于与插件注册表及后端对齐。
 */
export type WorkflowNode = Node<WorkflowNodeData, string> & {
  /** 对应 nodeTypes 的 key，与 data.pluginId 一致 */
  type?: string;
  data?: WorkflowNodeData;
};

/** 流程边：直接使用 React Flow 的 Edge */
export type WorkflowEdge = Edge;

/** 流程文档 JSON，用于 DSL 导入导出及与后端同步 */
export interface WorkflowDocument {
  /** 文档版本，便于后续兼容 */
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  /** 可选：元信息，如 appId、更新时间等 */
  meta?: {
    appId?: string;
    updatedAt?: string;
    [key: string]: unknown;
  };
}
