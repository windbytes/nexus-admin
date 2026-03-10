/**
 * 页面按钮配置（对应 t_sys_page_button）
 */
export interface PageButtonModel {
  /** 主键 */
  id: string;
  /** 所属菜单 */
  menuId: string;
  /** 按钮唯一编码 */
  code: string;
  /** 按钮名称 */
  name: string;
  /** 权限标识，对应 t_sys_permission.permission_code */
  permCode: string;
  /** 排序 */
  sort: number;
  /** 状态 true-启用 false-禁用 */
  status: boolean;
  /** 逻辑删除标志 */
  delFlag?: boolean;
  /** 创建人 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新人 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: string;
}

/** 新增/编辑页面按钮请求 */
export interface PageButtonSaveParams {
  id?: string;
  menuId: string;
  code: string;
  name: string;
  permCode: string;
  sort?: number;
  status?: boolean;
}

/** 按菜单查询页面按钮请求 */
export interface QueryPageButtonsParams {
  menuId: string;
  code?: string;
  name?: string;
  permCode?: string;
}
