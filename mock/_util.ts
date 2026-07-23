/**
 * Mock 响应体需与后端统一包装一致：{ code, message, data, success }
 * 见 src/types/global.d.ts Response
 */
export function ok<T>(data: T, message = 'ok') {
  return {
    code: 200,
    message,
    data,
    success: true,
  };
}

export function fail(message: string, code = 500) {
  return {
    code,
    message,
    data: null,
    success: false,
  };
}
