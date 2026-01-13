import type { PageQueryParams } from '@/types/global';

/**
 * 权限点模型
 */
export interface PermissionModel {
  /**
   * 主键ID
   */
  id: string;

  /**
   * 权限点编码
   */
  permCode: string;

  /**
   * 权限点名称
   */
  permName: string;

  /**
   * 权限点类型 ACTION / DATA
   */
  permType: 'ACTION' | 'DATA';

  /**
   * 模块编码
   */
  moduleCode: string;

  /**
   * 描述
   */
  description: string;

  /**
   * 状态 1-启用 0-停用
   */
  status: number;

  /**
   * 扩展字段
   */
  extJson?: Record<string, any>;

  /**
   * 删除标记
   */
  delFlag: boolean;

  /**
   * 创建人
   */
  createBy: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 更新人
   */
  updateBy: string;

  /**
   * 更新时间
   */
  updateTime: string;
}

/**
 * 权限点查询参数
 */
export interface PermissionSearchParams extends PageQueryParams {
  /**
   * 权限点编码
   */
  permCode?: string;

  /**
   * 权限点名称
   */
  permName?: string;

  /**
   * 权限点类型
   */
  permType?: 'ACTION' | 'DATA';

  /**
   * 模块编码
   */
  moduleCode?: string;

  /**
   * 状态
   */
  status?: number;
}

/**
 * 权限资源关联模型
 */
export interface PermissionResourceModel {
  /**
   * 权限ID
   */
  permissionId: string;

  /**
   * 资源ID
   */
  resourceId: string;

  /**
   * 资源类型 ACTION / API
   */
  resourceType: 'ACTION' | 'API';
}

/**
 * 保存权限点请求参数（包含基础信息和资源绑定）
 */
export interface SavePermissionRequest {
  /**
   * 权限点基础信息（如果是编辑，需要包含id）
   */
  permission: Partial<PermissionModel>;

  /**
   * 绑定的资源列表
   */
  resources: PermissionResourceModel[];
}
