/**
 * 页面按钮配置类型（对应 sys_page_button）。
 */

/** 页面按钮模型 */
export interface PageButtonModel {
  /** 主键 */
  id: string;
  /** 所属菜单 ID */
  menuId: string;
  /** 按钮唯一编码 */
  code: string;
  /** 按钮名称 */
  name: string;
  /** 权限标识，对应 sys_permission.perm_code（resource_type=1） */
  permCode: string;
  /** 排序 */
  sort: number;
  /** 状态：true 启用 / false 停用 */
  status: boolean;
  delFlag?: boolean;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
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
