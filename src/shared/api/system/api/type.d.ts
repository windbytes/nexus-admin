/**
 * 菜单下接口配置类型（对应 sys_api）。
 */

/** 系统接口模型 */
export interface ApiModel {
  /** 主键 */
  id: string;
  /** 所属菜单 ID */
  menuId: string;
  /** 权限标识，对应 sys_permission.perm_code（resource_type=2） */
  permCode?: string;
  /** 接口名称 */
  name: string;
  /** 接口路径 */
  path: string;
  /** HTTP 方法 */
  method: string;
  /** 描述 */
  remark: string;
  delFlag?: boolean;
  /** 是否公开（无需鉴权） */
  isPublic?: boolean;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 新增/编辑接口请求 */
export interface ApiSaveParams {
  id?: string;
  menuId: string;
  permCode?: string;
  name: string;
  path: string;
  method: string;
  remark: string;
  isPublic?: boolean;
}

/** 按菜单查询接口请求 */
export interface QueryApisParams {
  menuId: string;
}
