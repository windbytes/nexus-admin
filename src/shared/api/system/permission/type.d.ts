import type { PageQueryParams } from '@/types/global';

/**
 * 权限点类型：0-目录分组，1-按钮，2-接口。
 */
export type PermType = 0 | 1 | 2;

/**
 * 系统权限点模型（对应 sys_permission 统一权限点树）。
 */
export interface PermissionModel {
  /** 主键 */
  id: string;
  /** 父节点ID，0=根节点 */
  parentId: string;
  /** 所属菜单（按钮类权限归属页面） */
  menuId?: string;
  /** 权限点编码（全局唯一，规范 {domain}:{resource}:{action}） */
  permCode: string;
  /** 权限点名称 */
  permName: string;
  /** 权限点类型：0-目录分组 1-按钮 2-接口 */
  permType: PermType;
  /** 图标 */
  icon?: string;
  /** 排序 */
  sort: number;
  /** 状态：true 启用 / false 停用 */
  status: boolean;
  /** 备注 */
  remark?: string;
  /** 子节点（树形展示） */
  children?: PermissionModel[];
  delFlag?: boolean;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/**
 * 权限点分页查询参数。
 */
export interface PermissionSearchParams extends PageQueryParams {
  permCode?: string;
  permName?: string;
  /** 权限点类型：0-目录分组 1-按钮 2-接口 */
  permType?: PermType;
  /** 所属菜单（按钮类权限按页面过滤） */
  menuId?: string;
  status?: boolean;
}

/**
 * 权限点保存参数（新增/编辑）。
 */
export interface PermissionSaveParams {
  id?: string;
  parentId: string;
  menuId?: string;
  permCode: string;
  permName: string;
  permType: PermType;
  icon?: string;
  sort?: number;
  status?: boolean;
  remark?: string;
}
