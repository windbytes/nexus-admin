import type { PageQueryParams } from '@/types/global';

/**
 * 权限点资源类型枚举
 */
export type ResourceType = 1 | 2 | 4;

/**
 * 权限点模型
 */
export interface PermissionModel {
  /** 主键 */
  id: string;
  /** 权限点编码 */
  permCode: string;
  /** 权限点名称 */
  permName: string;
  /** 描述 */
  description?: string;
  /** 资源类型 1-按钮 2-接口 4-其他 */
  resourceType: ResourceType;
  /** 排序 */
  sort: number;
  /** 状态 true-启用 false-停用 */
  status: boolean;
  /** 扩展字段 */
  extJson?: Record<string, unknown>;
  /** 删除标记 */
  delFlag: boolean;
  /** 创建人 */
  createBy: string;
  /** 创建时间 */
  createTime: string;
  /** 更新人 */
  updateBy: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 权限点查询参数
 */
export interface PermissionSearchParams extends PageQueryParams {
  /** 权限点编码 */
  permCode?: string;
  /** 权限点名称 */
  permName?: string;
  /** 资源类型 */
  resourceType?: number;
  /** 状态 */
  status?: boolean;
}
