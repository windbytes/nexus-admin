/**
 * Engine 执行记录模块类型定义
 * 与后端 entity/execution 及 controller 对齐
 */

/** 流程执行记录（t_engine_flow_execution，分区表） */
export interface FlowExecution {
  id: string;
  flowVersionId: string;
  traceId?: string;
  status?: string;
  startedTime?: string;
  endedTime?: string;
  durationMs?: number;
  errorMsg?: string;
}

/** 节点执行记录（t_engine_node_execution，分区表） */
export interface NodeExecution {
  id: string;
  executionId: string;
  nodeKey?: string;
  status?: string;
  retryCount?: number;
  startedTime?: string;
  endedTime?: string;
  durationMs?: number;
  errorMsg?: string;
}

/** 死信（t_engine_dead_letter，分区表） */
export interface DeadLetter {
  id: string;
  traceId?: string;
  flowVersionId?: string;
  nodeKey?: string;
  payload?: unknown;
  errorMsg?: string;
  retryCount?: number;
  status?: string;
  createdTime?: string;
}

/** 执行分页查询参数（需时间范围以触发分区裁剪） */
export interface ExecutionPageParams {
  flowVersionId: string;
  from: string; // ISO 8601
  to: string;
  pageNum?: number;
  pageSize?: number;
}

/** 死信分页查询参数 */
export interface DeadLetterPageParams {
  status?: string;
  from: string;
  to: string;
  pageNum?: number;
  pageSize?: number;
}
