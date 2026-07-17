import type { PageQueryParams } from '@/types/global';

/**
 * 权限点资源类型：1-按钮，2-接口，4-其他。
 */
export type ResourceType = 1 | 2 | 4;

/**
 * 系统权限点模型（对应 sys_permission）。
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
  /** 资源类型：1-按钮，2-接口，4-其他 */
  resourceType: ResourceType;
  /** 排序 */
  sort: number;
  /** 状态：true 启用 / false 停用 */
  status: boolean;
  extJson?: Record<string, unknown>;
  delFlag: boolean;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
}

/**
 * 权限点分页查询参数。
 */
export interface PermissionSearchParams extends PageQueryParams {
  permCode?: string;
  permName?: string;
  resourceType?: number;
  status?: boolean;
}
