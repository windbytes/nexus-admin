/**
 * Engine 执行记录 API
 * 路径与后端 /engine/executions 一致，分区表查询需传 from/to
 */
import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type {
  FlowExecution,
  NodeExecution,
  DeadLetter,
  ExecutionPageParams,
  DeadLetterPageParams,
} from './types';

const ExecutionsApi = {
  list: '/engine/executions',
  trace: (traceId: string) => `/engine/executions/trace/${traceId}`,
  nodes: (executionId: string) => `/engine/executions/${executionId}/nodes`,
  deadLetters: '/engine/executions/dead-letters',
  deadLetterResolve: (id: string) => `/engine/executions/dead-letters/${id}/resolve`,
};

export const executionService = {
  async pageExecutions(params: ExecutionPageParams): Promise<PageResult<FlowExecution>> {
    const { flowVersionId, from, to, pageNum = 1, pageSize = 20 } = params;
    return HttpRequest.get<PageResult<FlowExecution>>(
      {
        url: ExecutionsApi.list,
        params: { flowVersionId, from, to, pageNum, pageSize },
      },
      { successMessageMode: 'none' }
    );
  },

  async getByTraceId(traceId: string, from: string, to: string): Promise<FlowExecution | null> {
    return HttpRequest.get<FlowExecution>(
      { url: ExecutionsApi.trace(traceId), params: { from, to } },
      { successMessageMode: 'none' }
    );
  },

  async listNodeExecutions(
    executionId: string,
    from: string,
    to: string
  ): Promise<NodeExecution[]> {
    const res = await HttpRequest.get<NodeExecution[]>(
      { url: ExecutionsApi.nodes(executionId), params: { from, to } },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },

  async pageDeadLetters(params: DeadLetterPageParams): Promise<PageResult<DeadLetter>> {
    const { status, from, to, pageNum = 1, pageSize = 20 } = params;
    const query: Record<string, unknown> = { from, to, pageNum, pageSize };
    if (status != null) query.status = status;
    return HttpRequest.get<PageResult<DeadLetter>>(
      { url: ExecutionsApi.deadLetters, params: query },
      { successMessageMode: 'none' }
    );
  },

  async resolveDeadLetter(id: string, createdTime: string): Promise<void> {
    await HttpRequest.post({
      url: ExecutionsApi.deadLetterResolve(id),
      params: { createdTime },
    });
  },
};
