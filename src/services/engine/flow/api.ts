/**
 * Engine 流程定义与版本 API
 * 与后端 FlowDefinitionController（/engine/flows）、FlowVersionController（/engine/flow-version/{flowId}）对齐
 */
import { HttpRequest } from '@/utils/request';
import type {
  FlowDefinition,
  FlowDraftPayload,
  FlowRunStatusResponse,
  FlowVersion,
  FlowVersionDTO,
  Page,
  RouteMetricsDTO,
  RouteStatusDTO,
} from './types';

/** 流程定义相关路径（FlowDefinitionController） */
const FlowsApi = {
  /** GET 按 appId 查询列表 */
  list: '/engine/flows',
  getById: (id: string) => `/engine/flows/${id}`,
  /** POST 创建 */
  create: '/engine/flows/create',
  /** POST 更新 */
  update: (id: string) => `/engine/flows/update/${id}`,
  /** POST 删除 */
  delete: (id: string) => `/engine/flows/delete/${id}`,
};

/** 流程版本与路由相关路径（FlowVersionController，基路径 /engine/flow-version/{flowId}） */
const flowVersionBase = (flowId: string) => `/engine/flow-version/${flowId}`;

/**
 * 将路由状态 DTO 映射为 UI 运行状态展示
 * STARTED → running，STOPPED → idle，ERROR → failed，SUSPENDED → idle
 */
export function mapRouteStatusToRunStatus(dto: RouteStatusDTO | null): FlowRunStatusResponse | null {
  if (!dto) {
    return null;
  }
  let status: FlowRunStatusResponse['status'] = 'idle';
  if (dto.status === 'STARTED') {
    status = 'running';
  } else if (dto.status === 'ERROR') {
    status = 'failed';
  } else if (dto.status === 'STOPPED' || dto.status === 'SUSPENDED') {
    status = 'idle';
  }
  return {
    status,
    lastRunAt: dto.lastTriggered,
    routeStatus: dto.status,
  };
}

export const flowDefinitionService = {
  /**
   * 按应用 ID 查询流程定义列表
   * @description 对应后端 GET /engine/flows?appId=
   * @param appId 应用 ID
   * @returns 流程定义列表
   */
  async listByAppId(appId: string): Promise<FlowDefinition[]> {
    const res = await HttpRequest.get<FlowDefinition[]>(
      { url: FlowsApi.list, params: { appId } },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },

  /**
   * 查询流程定义详情
   * @description 对应后端 GET /engine/flows/{id}
   * @param id 流程定义 ID
   * @returns 流程定义或 null
   */
  async getById(id: string): Promise<FlowDefinition | null> {
    return HttpRequest.get<FlowDefinition>({ url: FlowsApi.getById(id) }, { successMessageMode: 'none' });
  },

  /**
   * 创建流程定义
   * @description 对应后端 POST /engine/flows/create
   * @param definition 流程定义（至少含 tenantId、appId、flowKey、flowName）
   * @returns 创建后的流程定义
   */
  async create(definition: Partial<FlowDefinition>): Promise<FlowDefinition> {
    return HttpRequest.post<FlowDefinition>({ url: FlowsApi.create, data: definition });
  },

  /**
   * 更新流程定义
   * @description 对应后端 POST /engine/flows/update/{id}
   * @param id 流程定义 ID
   * @param definition 流程定义（后端会 set id）
   * @returns 更新后的流程定义
   */
  async update(id: string, definition: Partial<FlowDefinition>): Promise<FlowDefinition> {
    return HttpRequest.post<FlowDefinition>({ url: FlowsApi.update(id), data: { ...definition, id } });
  },

  /**
   * 删除流程定义
   * @description 对应后端 POST /engine/flows/delete/{id}
   * @param id 流程定义 ID
   */
  async delete(id: string): Promise<void> {
    await HttpRequest.post({ url: FlowsApi.delete(id) });
  },
};

export const flowVersionService = {
  /**
   * 获取草稿内容（供前端加载画布）
   * @description 对应后端 GET /engine/flow-version/{flowId}/draft；若无草稿则后端自动创建空 DRAFT 后返回空列表
   * @param flowId 流程定义 ID
   * @returns 草稿节点与边（与 FlowDraftDTO 同结构）
   */
  async getDraft(flowId: string): Promise<FlowDraftPayload> {
    const res = await HttpRequest.get<FlowDraftPayload>(
      { url: `${flowVersionBase(flowId)}/draft` },
      { successMessageMode: 'none' }
    );
    return res ?? { nodes: [], edges: [] };
  },

  /**
   * 保存草稿（创建或覆盖 DRAFT 版本的节点/边）
   * @description 对应后端 POST /engine/flow-version/{flowId}/draft
   * @param flowId 流程定义 ID
   * @param payload 草稿内容（nodes、edges，与 FlowDraftDTO 一致）
   */
  async saveDraft(flowId: string, payload: FlowDraftPayload): Promise<void> {
    await HttpRequest.post({ url: `${flowVersionBase(flowId)}/draft`, data: payload });
  },

  /**
   * 发布流程版本
   * @description 对应后端 POST /engine/flow-version/{flowId}/publish?versionTag=
   * @param flowId 流程定义 ID
   * @param versionTag 版本标签（可选，如 v1.0）
   * @returns 已发布的版本实体
   */
  async publish(flowId: string, versionTag?: string): Promise<FlowVersion> {
    return HttpRequest.post<FlowVersion>({
      url: `${flowVersionBase(flowId)}/publish`,
      params: versionTag != null ? { versionTag } : undefined,
    });
  },

  /**
   * 回滚到指定历史版本
   * @description 对应后端 POST /engine/flow-version/{flowId}/rollback/{version}
   * @param flowId 流程定义 ID
   * @param version 目标版本号
   */
  async rollback(flowId: string, version: number): Promise<void> {
    await HttpRequest.post({ url: `${flowVersionBase(flowId)}/rollback/${version}` });
  },

  /**
   * 版本历史（分页）
   * @description 对应后端 GET /engine/flow-version/{flowId}/versions?pageNum=&pageSize=
   * @param flowId 流程定义 ID
   * @param pageNum 页码（从 1 开始）
   * @param pageSize 每页大小
   * @returns 分页结果（records + totalRow）
   */
  async listVersions(flowId: string, pageNum: number = 1, pageSize: number = 20): Promise<Page<FlowVersionDTO>> {
    const res = await HttpRequest.get<Page<FlowVersionDTO>>(
      {
        url: `${flowVersionBase(flowId)}/versions`,
        params: { pageNum, pageSize },
      },
      { successMessageMode: 'none' }
    );
    if (res && typeof res === 'object' && Array.isArray((res as { records?: FlowVersionDTO[] }).records)) {
      return res as Page<FlowVersionDTO>;
    }
    if (res && typeof res === 'object' && Array.isArray((res as { list?: FlowVersionDTO[] }).list)) {
      const r = res as unknown as { list: FlowVersionDTO[]; total?: number };
      return { records: r.list, totalRow: r.total ?? r.list.length, pageNumber: pageNum, pageSize };
    }
    if (Array.isArray(res)) {
      return { records: res as FlowVersionDTO[], totalRow: res.length, pageNumber: pageNum, pageSize };
    }
    return { records: [], totalRow: 0, pageNumber: pageNum, pageSize };
  },

  /**
   * 版本详情（含 flowSnapshot）
   * @description 对应后端 GET /engine/flow-version/{flowId}/versions/{version}
   * @param flowId 流程定义 ID
   * @param version 版本号
   * @returns 版本 DTO 或 null
   */
  async getVersion(flowId: string, version: number): Promise<FlowVersionDTO | null> {
    return HttpRequest.get<FlowVersionDTO>(
      { url: `${flowVersionBase(flowId)}/versions/${version}` },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 当前在线版本
   * @description 对应后端 GET /engine/flow-version/{flowId}/current
   * @param flowId 流程定义 ID
   * @returns 当前版本实体或 null
   */
  async getCurrent(flowId: string): Promise<FlowVersion | null> {
    return HttpRequest.get<FlowVersion>({ url: `${flowVersionBase(flowId)}/current` }, { successMessageMode: 'none' });
  },

  /**
   * 查询路由运行状态
   * @description 对应后端 GET /engine/flow-version/{flowId}/route/status
   * @param flowId 流程定义 ID
   * @returns 路由状态 DTO
   */
  async getRouteStatus(flowId: string): Promise<RouteStatusDTO> {
    return HttpRequest.get<RouteStatusDTO>(
      { url: `${flowVersionBase(flowId)}/route/status` },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 查询路由运行指标
   * @description 对应后端 GET /engine/flow-version/{flowId}/route/metrics
   * @param flowId 流程定义 ID
   * @returns 路由指标 DTO
   */
  async getRouteMetrics(flowId: string): Promise<RouteMetricsDTO> {
    return HttpRequest.get<RouteMetricsDTO>(
      { url: `${flowVersionBase(flowId)}/route/metrics` },
      { successMessageMode: 'none' }
    );
  },

  /**
   * 重部署路由（停止 + 重启）
   * @description 对应后端 POST /engine/flow-version/{flowId}/route/redeploy
   * @param flowId 流程定义 ID
   */
  async redeploy(flowId: string): Promise<void> {
    await HttpRequest.post({ url: `${flowVersionBase(flowId)}/route/redeploy` });
  },

  /**
   * 停止路由
   * @description 对应后端 POST /engine/flow-version/{flowId}/route/stop
   * @param flowId 流程定义 ID
   */
  async stopRoute(flowId: string): Promise<void> {
    await HttpRequest.post({ url: `${flowVersionBase(flowId)}/route/stop` });
  },
};
