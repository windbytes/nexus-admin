/**
 * @file 系统接口管理页常量
 */

/** 请求方法对应的 Tag 颜色 */
export const METHOD_TAG_COLOR: Record<string, string> = {
  GET: 'blue',
  POST: 'orange',
  PUT: 'purple',
  DELETE: 'red',
  PATCH: 'cyan',
  HEAD: 'default',
  OPTIONS: 'default',
  '*': 'green',
};

/** 请求方法选项（含 * 任意方法） */
export const METHOD_OPTIONS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'HEAD', label: 'HEAD' },
  { value: 'OPTIONS', label: 'OPTIONS' },
  { value: '*', label: '*（任意）' },
];

/** 注册来源对应的 Tag 颜色 */
export const SOURCE_TAG: Record<number, { label: string; color: string }> = {
  1: { label: '手工登记', color: 'blue' },
  2: { label: '扫描同步', color: 'purple' },
};

/**
 * 按 HTTP 方法返回 Tag 颜色。
 *
 * @param method - 请求方法
 * @returns antd Tag color
 */
export function getMethodColor(method: string): string {
  return METHOD_TAG_COLOR[method?.toUpperCase()] ?? 'default';
}
