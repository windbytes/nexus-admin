/**
 * 流程编排后端 API
 * 按 appId 查询节点配置、边配置、节点属性配置、运行状态等
 */
import { HttpRequest } from '@/utils/request';

/** 流程节点（与前端 WorkflowNode 结构一致，便于 loadDocument） */
export interface WorkflowConfigNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  [key: string]: unknown;
}

/** 流程边（与前端 WorkflowEdge 结构一致） */
export interface WorkflowConfigEdge {
  id?: string;
  source: string;
  target: string;
  [key: string]: unknown;
}

/** 后端返回的流程配置（节点 + 边） */
export interface WorkflowConfigResponse {
  version?: number;
  nodes: WorkflowConfigNode[];
  edges: WorkflowConfigEdge[];
  meta?: { appId?: string; updatedAt?: string; [key: string]: unknown };
  /** 各节点类型的属性配置 schema（可选，用于服务端驱动表单） */
  nodePropertyConfigs?: Record<string, NodePropertyConfigSchema>;
}

/** 单节点类型的属性配置 schema（后端可扩展） */
export interface NodePropertyConfigSchema {
  pluginId: string;
  schemaVersion?: string;
  /** 表单项/字段定义，与前端 ConfigPanel 或动态表单对接 */
  fields?: Array<{
    key: string;
    label: string;
    type: string;
    required?: boolean;
    defaultValue?: unknown;
    options?: Array<{ label: string; value: string | number }>;
    [k: string]: unknown;
  }>;
  [key: string]: unknown;
}

/** 流程运行状态 */
export type WorkflowRunStatus = 'idle' | 'running' | 'success' | 'failed';

export interface WorkflowRunStatusResponse {
  status: WorkflowRunStatus;
  lastRunAt?: string;
  message?: string;
  executionId?: string;
  /** 各节点执行状态（可选） */
  nodeStatuses?: Record<string, { status: string; output?: unknown }>;
}

enum WorkflowAction {
  getConfig = '/integrated/workflow/getConfig',
  getRunStatus = '/integrated/workflow/getRunStatus',
  saveConfig = '/integrated/workflow/saveConfig',
}

/**
 * 流程编排服务
 */
export const workflowService = {
  /**
   * 根据 appId 查询流程配置（节点、边、节点属性配置）
   */
  async getWorkflowConfig(appId: string): Promise<WorkflowConfigResponse> {
    const res = await HttpRequest.get<WorkflowConfigResponse>({
      url: WorkflowAction.getConfig,
      params: { appId },
    }, { successMessageMode: 'none' });
    return res as WorkflowConfigResponse;
  },

  /**
   * 查询流程运行状态
   */
  async getWorkflowRunStatus(appId: string): Promise<WorkflowRunStatusResponse> {
    const res = await HttpRequest.get<WorkflowRunStatusResponse>({
      url: WorkflowAction.getRunStatus,
      params: { appId },
    }, { successMessageMode: 'none' });
    return res as WorkflowRunStatusResponse;
  },

  /**
   * 保存流程配置到后端
   */
  async saveWorkflowConfig(appId: string, doc: WorkflowConfigResponse): Promise<void> {
    await HttpRequest.post({
      url: WorkflowAction.saveConfig,
      data: { appId, ...doc },
    });
  },
};
