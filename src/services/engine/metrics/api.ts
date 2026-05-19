/**
 * Engine 指标聚合 API
 * 路径与后端 /engine/metrics 一致
 */
import { HttpRequest } from '@/utils/request';
import type { FlowMetricsParams, MetricsFlowAgg, MetricsNodeAgg, NodeMetricsParams } from './types';

const MetricsApi = {
  flow: '/engine/metrics/flow',
  node: '/engine/metrics/node',
};

export const metricsService = {
  async queryFlowMetrics(params: FlowMetricsParams): Promise<MetricsFlowAgg[]> {
    const res = await HttpRequest.get<MetricsFlowAgg[]>(
      { url: MetricsApi.flow, params: { ...params } },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },

  async queryNodeMetrics(params: NodeMetricsParams): Promise<MetricsNodeAgg[]> {
    const res = await HttpRequest.get<MetricsNodeAgg[]>(
      { url: MetricsApi.node, params: { ...params } },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },
};
