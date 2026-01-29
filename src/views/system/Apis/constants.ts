/** 可配置接口的菜单：menu_type in (1,2) 且 is_leaf = true */
export const CAN_ATTACH_API_MENU_TYPES = [1, 2] as const;

/** 请求方法对应的 Tag 颜色 */
export const METHOD_TAG_COLOR: Record<string, string> = {
  GET: 'blue',
  POST: 'orange',
  PUT: 'purple',
  DELETE: 'red',
  PATCH: 'cyan',
  HEAD: 'default',
  OPTIONS: 'default',
};

export function getMethodColor(method: string): string {
  return METHOD_TAG_COLOR[method?.toUpperCase()] ?? 'default';
}
