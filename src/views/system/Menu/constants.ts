/**
 * 菜单类型枚举
 */
export const MENU_TYPE = {
  TOP_LEVEL: 0,
  SUB_MENU: 1,
  SUB_ROUTE: 2,
  PERMISSION_BUTTON: 3,
} as const;

export type MenuType = (typeof MENU_TYPE)[keyof typeof MENU_TYPE];

/**
 * 菜单类型选项
 */
export const MENU_TYPE_OPTIONS = [
  { value: MENU_TYPE.SUB_MENU, label: '子菜单' },
  { value: MENU_TYPE.SUB_ROUTE, label: '子路由' },
  { value: MENU_TYPE.TOP_LEVEL, label: '目录' },
];
