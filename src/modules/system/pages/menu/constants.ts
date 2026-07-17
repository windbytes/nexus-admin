/**
 * @file 菜单类型常量与选项
 * @description 与后端 `sys_menu.menu_type` 枚举值保持一致。
 */

/**
 * 菜单类型枚举值。
 * - `TOP_LEVEL` (0)：一级目录
 * - `SUB_MENU` (1)：子菜单（可配置路由与组件）
 * - `SUB_ROUTE` (2)：子路由
 * - `PERMISSION_BUTTON` (3)：权限按钮（通常由按钮管理模块维护）
 */
export const MENU_TYPE = {
  TOP_LEVEL: 0,
  SUB_MENU: 1,
  SUB_ROUTE: 2,
  PERMISSION_BUTTON: 3,
} as const;

/** {@link MENU_TYPE} 值的联合类型 */
export type MenuType = (typeof MENU_TYPE)[keyof typeof MENU_TYPE];

/**
 * 菜单表单中可选的类型选项（不含权限按钮，按钮由独立模块维护）。
 */
export const MENU_TYPE_OPTIONS = [
  { value: MENU_TYPE.SUB_MENU, label: '子菜单' },
  { value: MENU_TYPE.SUB_ROUTE, label: '子路由' },
  { value: MENU_TYPE.TOP_LEVEL, label: '目录' },
];
