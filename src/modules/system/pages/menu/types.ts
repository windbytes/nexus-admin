/**
 * @file 菜单管理页查询参数类型
 */

/**
 * 菜单列表搜索表单参数。
 * <p>
 * 页面内部使用 `name` 字段；提交 API 时会映射为后端的 `menuName`。
 * </p>
 */
export interface MenuSearchParams {
  /** 菜单名称（模糊搜索），对应后端 `menuName` */
  name?: string;
  /** 状态：true 启用 / false 停用；不传表示不过滤 */
  status?: boolean;
  /** 菜单类型：0 目录 / 1 子菜单 / 2 子路由 / 3 权限按钮 */
  menuType?: number;
}
