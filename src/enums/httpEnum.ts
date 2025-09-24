/**
 * 枚举HTTP的状态码
 */
export enum HttpCodeEnum {
  RC100 = 100,
  SUCCESS = 200,
  // 用户未登录
  RC101 = 101,
  // 账户被禁用
  RC102 = 102,
  // 用户名不存在
  RC107 = 107,
  // 密码输入错误
  RC108 = 108,
  // 身份验证凭据已过期或无效，请重新登录！
  RC401 = 401,
  // 登录次数失败过多
  RC111 = 111,
  // 验证码错误
  RC300 = 300,
  // 验证码已过期
  RC301 = 301,
  // 无权限
  RC403 = 403,
  // 未找到响应的资源
  RC404 = 404,
  // 后端服务异常
  RC500 = 500,
  // 网关异常（后端服务不可访问）
  RC502 = 502,
}

/**
 * @description:  contentTyp
 */
export enum ContentTypeEnum {
  // json
  JSON = 'application/json;charset=UTF-8',
  // form-data qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  // form-data  upload
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
}

/**
 * @description: request method
 */
export enum RequestEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
