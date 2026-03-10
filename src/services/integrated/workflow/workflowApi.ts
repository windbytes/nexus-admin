/**
 * 流程编排后端 API
 * 按 appId 查询/保存节点配置、边配置、节点属性配置、运行状态等；接口定义与实现参考 userApi 规范
 */
import { HttpRequest } from '@/utils/request';
import type {
  WorkflowConfigResponse,
  WorkflowRunStatusResponse,
  NodePluginDTO,
  FlowVersionDTO,
  FlowDraftPayload,
  RouteStatusDTO,
} from './type';

/**
 * 流程编排接口地址常量（不使用 enum，便于与后端路径一致）
 */
const WorkflowAction = {
  getConfig: '/engine/workflow/getConfig',
  getRunStatus: '/engine/workflow/getRunStatus',
  saveConfig: '/engine/workflow/saveConfig',
  /** 节点插件（按分类分组） */
  nodePlugins: '/engine/node-plugins',
  /** 保存草稿 */
  saveDraft: (appId: string) => `/engine/flow/${appId}/save`,
  /** 发布 */
  publish: (appId: string) => `/engine/flow/${appId}/publish`,
  /** 回滚 */
  rollback: (appId: string, versionNo: number) => `/engine/flow/${appId}/rollback/${versionNo}`,
  /** 版本列表 */
  versions: (appId: string) => `/engine/flow/${appId}/versions`,
  /** 版本详情 */
  versionDetail: (appId: string, versionNo: number) => `/engine/flow/${appId}/versions/${versionNo}`,
  /** 部署/下线/重载 */
  deploy: (appId: string) => `/engine/flow/${appId}/deploy`,
  undeploy: (appId: string) => `/engine/flow/${appId}/undeploy`,
  redeploy: (appId: string) => `/engine/flow/${appId}/redeploy`,
  /** 部署状态与指标 */
  deployStatus: (appId: string) => `/engine/flow/${appId}/status`,
  deployMetrics: (appId: string) => `/engine/flow/${appId}/metrics`,
};

/**
 * 流程编排服务接口定义
 */
export interface IWorkflowService {
  /**
   * 根据 appId 查询流程配置（节点、边、节点属性配置）
   * @param appId 应用 ID
   * @returns 流程配置（nodes、edges、nodePropertyConfigs 等）
   */
  getWorkflowConfig(appId: string): Promise<WorkflowConfigResponse>;

  /**
   * 根据 appId 查询流程运行状态
   * @param appId 应用 ID
   * @returns 运行状态（idle/running/success/failed 及 lastRunAt、message 等）
   */
  getWorkflowRunStatus(appId: string): Promise<WorkflowRunStatusResponse>;

  /**
   * 保存流程配置到后端
   * @param appId 应用 ID
   * @param doc 流程文档（nodes、edges、version、meta 等）
   */
  saveWorkflowConfig(appId: string, doc: WorkflowConfigResponse): Promise<void>;

  /** 获取节点插件（按分类分组），含 configSchema */
  getNodePlugins(): Promise<Record<string, NodePluginDTO[]>>;

  /** 保存草稿（nodes + edges） */
  saveDraft(appId: string, draft: FlowDraftPayload): Promise<void>;

  /** 发布 */
  publish(appId: string, tag?: string, remark?: string): Promise<FlowVersionDTO & { id: string }>;

  /** 回滚到指定版本 */
  rollback(appId: string, versionNo: number): Promise<void>;

  /** 版本列表（分页） */
  listVersions(appId: string, page?: number, size?: number): Promise<FlowVersionDTO[]>;

  /** 版本详情 */
  getVersion(appId: string, versionNo: number): Promise<FlowVersionDTO>;

  /** 部署状态 */
  getDeployStatus(appId: string): Promise<RouteStatusDTO>;
}

/**
 * 流程编排服务实现
 */
export const workflowService: IWorkflowService = {
  /**
   * 根据 appId 查询流程配置
   */
  async getWorkflowConfig(appId: string): Promise<WorkflowConfigResponse> {
    const res = await HttpRequest.get<WorkflowConfigResponse>(
      {
        url: WorkflowAction.getConfig,
        params: { appId },
      },
      { successMessageMode: 'none' }
    );
    return res as WorkflowConfigResponse;
  },

  /**
   * 根据 appId 查询流程运行状态
   */
  async getWorkflowRunStatus(appId: string): Promise<WorkflowRunStatusResponse> {
    const res = await HttpRequest.get<WorkflowRunStatusResponse>(
      {
        url: WorkflowAction.getRunStatus,
        params: { appId },
      },
      { successMessageMode: 'none' }
    );
    return res as WorkflowRunStatusResponse;
  },

  async saveWorkflowConfig(appId: string, doc: WorkflowConfigResponse): Promise<void> {
    await HttpRequest.post({
      url: WorkflowAction.saveConfig,
      data: { appId, ...doc },
    });
  },

  async getNodePlugins(): Promise<Record<string, NodePluginDTO[]>> {
    const res = await HttpRequest.get<Record<string, NodePluginDTO[]>>(
      { url: WorkflowAction.nodePlugins },
      { successMessageMode: 'none' }
    );
    return res ?? {};
  },

  async saveDraft(appId: string, draft: FlowDraftPayload): Promise<void> {
    await HttpRequest.post({
      url: WorkflowAction.saveDraft(appId),
      data: draft,
    });
  },

  async publish(appId: string, tag?: string, remark?: string): Promise<FlowVersionDTO & { id: string }> {
    const res = await HttpRequest.post<FlowVersionDTO & { id: string }>({
      url: WorkflowAction.publish(appId),
      params: { tag, remark },
    });
    return res as FlowVersionDTO & { id: string };
  },

  async rollback(appId: string, versionNo: number): Promise<void> {
    await HttpRequest.post({ url: WorkflowAction.rollback(appId, versionNo) });
  },

  async listVersions(appId: string, page = 1, size = 20): Promise<FlowVersionDTO[]> {
    const res = await HttpRequest.get<FlowVersionDTO[]>({
      url: WorkflowAction.versions(appId),
      params: { page, size },
    });
    return Array.isArray(res) ? res : [];
  },

  async getVersion(appId: string, versionNo: number): Promise<FlowVersionDTO> {
    const res = await HttpRequest.get<FlowVersionDTO>({
      url: WorkflowAction.versionDetail(appId, versionNo),
    });
    return res as FlowVersionDTO;
  },

  async getDeployStatus(appId: string): Promise<RouteStatusDTO> {
    const res = await HttpRequest.get<RouteStatusDTO>({
      url: WorkflowAction.deployStatus(appId),
    }, { successMessageMode: 'none' });
    return res as RouteStatusDTO;
  },
};
