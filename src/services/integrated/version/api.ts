import { HttpRequest } from '@/utils/request';
import type {
  WorkflowVersion,
  WorkflowLock,
  WorkflowBranch,
  WorkflowVersionDelta,
  VersionListParams,
  CreateVersionParams,
  PublishVersionParams,
  VersionCompareParams,
  RollbackVersionParams,
} from './model';
import type { PageResult } from '@/types/global';

/**
 * 版本管理相关接口地址
 */
const VersionsApi: Record<string, string> = {
  /**
   * 获取版本列表
   */
  getVersionList: '/engine/workflows/{workflowId}/versions',
  /**
   * 获取版本详情
   */
  getVersionDetail: '/engine/workflows/{workflowId}/versions/{versionId}',
  /**
   * 创建版本
   */
  createVersion: '/engine/workflows/{workflowId}/createVersion',
  /**
   * 发布版本
   */
  publishVersion: '/engine/workflows/{workflowId}/versions/{version}/publish',
  /**
   * 删除版本
   */
  deleteVersion: '/engine/workflows/{workflowId}/versions/{versionId}',
  /**
   * 版本对比
   */
  compareVersions: '/engine/workflows/{workflowId}/versions/compare',
  /**
   * 回滚版本
   */
  rollbackVersion: '/engine/workflows/{workflowId}/versions/rollback',
  /**
   * 下载版本
   */
  downloadVersion: '/engine/workflows/{workflowId}/versions/{versionId}/download',
  /**
   * 获取版本锁信息
   */
  getVersionLocks: '/engine/workflows/{workflowId}/versions/locks',
  /**
   * 获取版本分支列表
   */
  getVersionBranches: '/engine/workflows/{workflowId}/branches',
  /**
   * 版本影响评估
   */
  assessVersionImpact: '/engine/workflows/{workflowId}/versions/{versionId}/impact',
  /**
   * 锁定版本进行编辑
   */
  lockVersion: '/engine/workflows/{workflowId}/versions/{version}/lock',
  /**
   * 释放版本锁定
   */
  unlockVersion: '/engine/workflows/{workflowId}/versions/{version}/lock',
};

/**
 * 版本管理服务接口
 */
export interface IVersionsService {
  /**
   * 获取版本列表
   */
  getVersionList(params: VersionListParams): Promise<PageResult<WorkflowVersion>>;
  /**
   * 获取版本详情
   */
  getVersionDetail(workflowId: string, versionId: string): Promise<WorkflowVersion>;
  /**
   * 创建版本
   */
  createVersion(params: CreateVersionParams): Promise<WorkflowVersion>;
  /**
   * 发布版本
   */
  publishVersion(params: PublishVersionParams): Promise<boolean>;
  /**
   * 删除版本
   */
  deleteVersion(workflowId: string, versionId: string): Promise<boolean>;
  /**
   * 版本对比
   */
  compareVersions(params: VersionCompareParams): Promise<{
    deltas: WorkflowVersionDelta[];
    diffContent: string;
  }>;
  /**
   * 回滚版本
   */
  rollbackVersion(params: RollbackVersionParams): Promise<boolean>;
  /**
   * 下载版本
   */
  downloadVersion(workflowId: string, versionId: string): Promise<Blob>;
  /**
   * 获取版本锁信息
   */
  getVersionLocks(workflowId: string): Promise<WorkflowLock[]>;
  /**
   * 获取版本分支列表
   */
  getVersionBranches(workflowId: string): Promise<WorkflowBranch[]>;
  /**
   * 版本影响评估
   */
  assessVersionImpact(
    workflowId: string,
    versionId: string,
  ): Promise<{
    backwardCompatible: boolean;
    nonDestructive: boolean;
    requiresRedeployment: boolean;
  }>;
  /**
   * 锁定版本进行编辑
   */
  lockVersion(workflowId: string, version: string): Promise<WorkflowLock>;
  /**
   * 释放版本锁定
   */
  unlockVersion(workflowId: string, version: string): Promise<boolean>;
}

/**
 * 版本管理服务实现
 */
export const versionsService: IVersionsService = {
  /**
   * 获取版本列表
   */
  async getVersionList(params: VersionListParams): Promise<PageResult<WorkflowVersion>> {
    const response = await HttpRequest.get(
      {
        url: VersionsApi.getVersionList.replace('{workflowId}', params.workflowId),
        params: {
          pageNum: params.pageNum,
          pageSize: params.pageSize,
          status: params.status,
          branch: params.branch,
          keyword: params.keyword,
        },
        adapter: 'fetch',
      },
      {
        successMessageMode: 'none',
      },
    );
    return response;
  },

  /**
   * 获取版本详情
   */
  async getVersionDetail(workflowId: string, versionId: string): Promise<WorkflowVersion> {
    const response = await HttpRequest.get({
      url: VersionsApi.getVersionDetail.replace('{workflowId}', workflowId).replace('{versionId}', versionId),
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 创建版本
   */
  async createVersion(params: CreateVersionParams): Promise<WorkflowVersion> {
    const response = await HttpRequest.post({
      url: VersionsApi.createVersion.replace('{workflowId}', params.workflowId),
      data: params,
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 发布版本
   */
  async publishVersion(params: PublishVersionParams): Promise<boolean> {
    const response = await HttpRequest.post({
      url: VersionsApi.publishVersion.replace('{workflowId}', params.workflowId).replace('{version}', params.version),
      data: params,
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 删除版本
   */
  async deleteVersion(workflowId: string, versionId: string): Promise<boolean> {
    const response = await HttpRequest.delete({
      url: VersionsApi.deleteVersion.replace('{workflowId}', workflowId).replace('{versionId}', versionId),
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 版本对比
   */
  async compareVersions(params: VersionCompareParams): Promise<{
    deltas: WorkflowVersionDelta[];
    diffContent: string;
  }> {
    const response = await HttpRequest.post({
      url: VersionsApi.compareVersions.replace('{workflowId}', params.workflowId),
      data: params,
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 回滚版本
   */
  async rollbackVersion(params: RollbackVersionParams): Promise<boolean> {
    const response = await HttpRequest.post({
      url: VersionsApi.rollbackVersion.replace('{workflowId}', params.workflowId),
      data: params,
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 下载版本
   */
  async downloadVersion(workflowId: string, versionId: string): Promise<Blob> {
    const response = await HttpRequest.get({
      url: VersionsApi.downloadVersion.replace('{workflowId}', workflowId).replace('{versionId}', versionId),
      responseType: 'blob',
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 获取版本锁信息
   */
  async getVersionLocks(workflowId: string): Promise<WorkflowLock[]> {
    const response = await HttpRequest.get({
      url: VersionsApi.getVersionLocks.replace('{workflowId}', workflowId),
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 获取版本分支列表
   */
  async getVersionBranches(workflowId: string): Promise<WorkflowBranch[]> {
    const response = await HttpRequest.get({
      url: VersionsApi.getVersionBranches.replace('{workflowId}', workflowId),
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 版本影响评估
   */
  async assessVersionImpact(
    workflowId: string,
    versionId: string,
  ): Promise<{
    backwardCompatible: boolean;
    nonDestructive: boolean;
    requiresRedeployment: boolean;
  }> {
    const response = await HttpRequest.get({
      url: VersionsApi.assessVersionImpact.replace('{workflowId}', workflowId).replace('{versionId}', versionId),
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 锁定版本进行编辑
   */
  async lockVersion(workflowId: string, version: string): Promise<WorkflowLock> {
    const response = await HttpRequest.post({
      url: VersionsApi.lockVersion.replace('{workflowId}', workflowId).replace('{version}', version),
      adapter: 'fetch',
    });
    return response;
  },

  /**
   * 释放版本锁定
   */
  async unlockVersion(workflowId: string, version: string): Promise<boolean> {
    const response = await HttpRequest.delete({
      url: VersionsApi.unlockVersion.replace('{workflowId}', workflowId).replace('{version}', version),
      adapter: 'fetch',
    });
    return response;
  },
};
