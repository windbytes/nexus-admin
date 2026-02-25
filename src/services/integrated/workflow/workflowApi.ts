/**
 * 流程编排后端 API
 * 按 appId 查询/保存节点配置、边配置、节点属性配置、运行状态等；接口定义与实现参考 userApi 规范
 */
import { HttpRequest } from '@/utils/request';
import type {
  WorkflowConfigResponse,
  WorkflowRunStatusResponse,
} from './type';

/**
 * 流程编排接口地址常量（不使用 enum，便于与后端路径一致）
 */
const WorkflowAction = {
  /** 根据 appId 查询流程配置（节点、边、节点属性配置） */
  getConfig: '/engine/workflow/getConfig',
  /** 根据 appId 查询流程运行状态 */
  getRunStatus: '/engine/workflow/getRunStatus',
  /** 保存流程配置到后端 */
  saveConfig: '/engine/workflow/saveConfig',
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
