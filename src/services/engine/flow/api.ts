/**
 * Engine 流程定义与版本 API
 * 路径与后端 /engine/flows、/engine/flows/{flowId} 一致
 */
import { HttpRequest } from '@/utils/request';
import type {
  FlowDefinition,
  FlowVersion,
  FlowDraftPayload,
  RouteStatusDTO,
  RouteMetricsDTO,
} from './types';

const FlowsApi = {
  list: '/engine/flows',
  getById: (id: string) => `/engine/flows/${id}`,
  create: '/engine/flows',
  update: (id: string) => `/engine/flows/${id}`,
  delete: (id: string) => `/engine/flows/${id}`,
};

const flowIdApi = (flowId: string) => ({
  draft: `/engine/flows/${flowId}/draft`,
  publish: `/engine/flows/${flowId}/publish`,
  rollback: (version: number) => `/engine/flows/${flowId}/rollback/${version}`,
  versions: `/engine/flows/${flowId}/versions`,
  version: (version: number) => `/engine/flows/${flowId}/versions/${version}`,
  current: `/engine/flows/${flowId}/current`,
  routeStatus: `/engine/flows/${flowId}/route/status`,
  routeMetrics: `/engine/flows/${flowId}/route/metrics`,
  routeRedeploy: `/engine/flows/${flowId}/route/redeploy`,
  routeStop: `/engine/flows/${flowId}/route/stop`,
});

export const flowDefinitionService = {
  async listByAppId(appId: string): Promise<FlowDefinition[]> {
    const res = await HttpRequest.get<FlowDefinition[]>(
      { url: FlowsApi.list, params: { appId } },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },

  async getById(id: string): Promise<FlowDefinition | null> {
    return HttpRequest.get<FlowDefinition>({ url: FlowsApi.getById(id) }, { successMessageMode: 'none' });
  },

  async create(definition: Partial<FlowDefinition>): Promise<FlowDefinition> {
    return HttpRequest.post<FlowDefinition>({ url: FlowsApi.create, data: definition });
  },

  async update(id: string, definition: Partial<FlowDefinition>): Promise<FlowDefinition> {
    return HttpRequest.put<FlowDefinition>({ url: FlowsApi.update(id), data: { ...definition, id } });
  },

  async delete(id: string): Promise<void> {
    await HttpRequest.delete({ url: FlowsApi.delete(id) });
  },
};

export const flowVersionService = {
  async saveDraft(flowId: string, payload: FlowDraftPayload): Promise<FlowVersion> {
    return HttpRequest.post<FlowVersion>({ url: flowIdApi(flowId).draft, data: payload });
  },

  async publish(flowId: string, tag?: string, remark?: string): Promise<FlowVersion> {
    return HttpRequest.post<FlowVersion>({
      url: flowIdApi(flowId).publish,
      params: tag != null || remark != null ? { tag, remark } : undefined,
    });
  },

  async rollback(flowId: string, version: number): Promise<void> {
    await HttpRequest.post({ url: flowIdApi(flowId).rollback(version) });
  },

  async listVersions(flowId: string): Promise<FlowVersion[]> {
    const res = await HttpRequest.get<FlowVersion[]>(
      { url: flowIdApi(flowId).versions },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },

  async getVersion(flowId: string, version: number): Promise<FlowVersion | null> {
    return HttpRequest.get<FlowVersion>(
      { url: flowIdApi(flowId).version(version) },
      { successMessageMode: 'none' }
    );
  },

  async getCurrent(flowId: string): Promise<FlowVersion | null> {
    return HttpRequest.get<FlowVersion>(
      { url: flowIdApi(flowId).current },
      { successMessageMode: 'none' }
    );
  },

  async getRouteStatus(flowId: string): Promise<RouteStatusDTO> {
    return HttpRequest.get<RouteStatusDTO>(
      { url: flowIdApi(flowId).routeStatus },
      { successMessageMode: 'none' }
    );
  },

  async getRouteMetrics(flowId: string): Promise<RouteMetricsDTO> {
    return HttpRequest.get<RouteMetricsDTO>(
      { url: flowIdApi(flowId).routeMetrics },
      { successMessageMode: 'none' }
    );
  },

  async redeploy(flowId: string): Promise<void> {
    await HttpRequest.post({ url: flowIdApi(flowId).routeRedeploy });
  },

  async stopRoute(flowId: string): Promise<void> {
    await HttpRequest.post({ url: flowIdApi(flowId).routeStop });
  },
};
