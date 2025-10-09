import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';

/**
 * 权限审计相关接口枚举
 */
const PermissionAuditApi = {
  // 权限使用统计
  getPermissionStatistics: '/system/permission/audit/statistics',
  // 权限变更日志
  getPermissionChangeLog: '/system/permission/audit/changeLog',
  // 异常权限检测
  getAnomalyDetection: '/system/permission/audit/anomaly',
};

/**
 * 权限统计数据类型
 */
export interface PermissionStatistics {
  totalButtons: number;
  activeButtons: number;
  inactiveButtons: number;
  totalInterfaces: number;
  usedInterfaces: number;
  unusedInterfaces: number;
  topUsedButtons: Array<{
    buttonId: string;
    buttonName: string;
    usageCount: number;
  }>;
  topUsedInterfaces: Array<{
    interfaceId: string;
    interfaceCode: string;
    usageCount: number;
  }>;
}

/**
 * 权限变更日志
 */
export interface PermissionChangeLog {
  id: string;
  operationType: 'create' | 'update' | 'delete' | 'assign' | 'revoke';
  targetType: 'button' | 'interface' | 'role';
  targetId: string;
  targetName: string;
  operatorId: string;
  operatorName: string;
  operationTime: string;
  description: string;
  beforeData?: any;
  afterData?: any;
}

/**
 * 异常检测结果
 */
export interface AnomalyDetectionResult {
  id: string;
  anomalyType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  detectedTime: string;
  status: 'pending' | 'resolved' | 'ignored';
}

/**
 * 权限审计服务接口
 */
export interface IPermissionAuditService {
  /**
   * 获取权限使用统计
   * @param timeRange 时间范围
   * @returns 统计数据
   */
  getPermissionStatistics(timeRange?: { startTime: string; endTime: string }): Promise<PermissionStatistics>;

  /**
   * 获取权限变更日志
   * @param params 查询参数
   * @returns 变更日志列表
   */
  getPermissionChangeLog(params: {
    pageNumber?: number;
    pageSize?: number;
    operationType?: string;
    targetType?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<PageResult<PermissionChangeLog>>;

  /**
   * 获取异常权限检测结果
   * @param params 查询参数
   * @returns 异常检测结果
   */
  getAnomalyDetection(params: { pageNumber?: number; pageSize?: number; anomalyType?: string }): Promise<
    PageResult<{
      records: AnomalyDetectionResult[];
    }>
  >;
}

/**
 * 权限审计服务实现
 */
export const permissionAuditService: IPermissionAuditService = {
  /**
   * 获取权限使用统计
   */
  async getPermissionStatistics(timeRange?: { startTime: string; endTime: string }): Promise<PermissionStatistics> {
    return HttpRequest.get<PermissionStatistics>({
      url: PermissionAuditApi.getPermissionStatistics,
      params: timeRange,
    });
  },

  /**
   * 获取权限变更日志
   */
  async getPermissionChangeLog(params: {
    pageNumber?: number;
    pageSize?: number;
    operationType?: string;
    targetType?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<PageResult<PermissionChangeLog>> {
    return HttpRequest.get({
      url: PermissionAuditApi.getPermissionChangeLog,
      params,
    });
  },

  /**
   * 获取异常权限检测结果
   */
  async getAnomalyDetection(params: { pageNumber?: number; pageSize?: number; anomalyType?: string }): Promise<
    PageResult<{
      records: AnomalyDetectionResult[];
    }>
  > {
    return HttpRequest.get({
      url: PermissionAuditApi.getAnomalyDetection,
      params,
    });
  },
};
