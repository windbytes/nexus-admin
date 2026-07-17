/* 类型判断 */
export function is(val: unknown, type: string) {
  return Object.prototype.toString.call(val) === `[object ${type}]`;
}

export function isObject(val: any): val is Record<any, any> {
  return val !== null && is(val, 'Object');
}

export function isFunction(val: unknown): boolean {
  return typeof val === 'function';
}

export function isString(val: unknown): val is string {
  return is(val, 'String');
}

// 判断系统平台
export const isMac = () => /Mac|iPod|iPhone|iPad/.test(navigator.platform);
export const isWindowsOrLinux = () => !isMac(); // 默认非 Mac 都按 Windows 处理
