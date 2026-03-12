/**
 * 流程编排模块 ID 生成工具
 */

/** 生成唯一的工作流节点 ID */
export function generateNodeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 生成唯一的工作流边 ID */
export function generateEdgeId(): string {
  return `edge-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
