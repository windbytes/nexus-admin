/**
 * Engine 指标聚合模块类型定义
 * 与后端 entity/metrics 及 controller 对齐
 */

/** 流程级聚合指标（t_engine_metrics_flow_agg） */
export interface MetricsFlowAgg {
  id: string;
  flowId: string;
  flowVersion?: number;
  bucketTime?: string;
  bucketGranularity?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  retryCount?: number;
  avgLatency?: number;
  p95Latency?: number;
  p99Latency?: number;
  maxLatency?: number;
  minLatency?: number;
  throughput?: number;
  errorRate?: number;
  createdAt?: string;
}

/** 节点级聚合指标（t_engine_metrics_node_agg） */
export interface MetricsNodeAgg {
  id: string;
  flowId: string;
  flowVersion?: number;
  nodeKey?: string;
  bucketTime?: string;
  bucketGranularity?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  retryCount?: number;
  avgLatency?: number;
  p95Latency?: number;
  p99Latency?: number;
  maxLatency?: number;
  minLatency?: number;
  createdTime?: string;
}

/** 流程指标查询参数 */
export interface FlowMetricsParams {
  flowId: string;
  flowVersion: number;
  granularity: string; // MINUTE | FIVE_MINUTE | HOUR | DAY
  from: string; // ISO 8601
  to: string;
}

/** 节点指标查询参数 */
export interface NodeMetricsParams {
  flowId: string;
  flowVersion: number;
  nodeKey?: string;
  granularity: string;
  from: string;
  to: string;
}
