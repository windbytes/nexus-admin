/**
 * 系统接口（对应 t_sys_api）
 */
export interface ApiModel {
  /** 主键 */
  id: string;
  /** 所属菜单 */
  menuId: string;
  /** 所需权限标识，对应 t_sys_permission.permission_code */
  permCode?: string;
  /** 接口名称 */
  name: string;
  /** 接口路径（存储模板路径） */
  path: string;
  /** 接口调用方法 GET/POST/PUT/DELETE 等 */
  method: string;
  /** 描述 */
  remark: string;
  /** 删除标记 */
  delFlag?: boolean;
  /** 是否公开，无需鉴权 */
  isPublic?: boolean;
  /** 创建人 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新人 */
  updateBy?: string;
  /** 更新时间 */
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
