import { ContentTypeEnum } from '@/enums/httpEnum';
import { deepMerge } from '../utils';
import { RAxios } from './Axios';
import { type CreateAxiosOptions, transform } from './transform';

/**
 * 封装axios
 */
function createAxios(opts?: Partial<CreateAxiosOptions>) {
  return new RAxios(
    deepMerge(
      {
        authenticationScheme: '',
        timeout: 0,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: true,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url（delete请求也需要添加）
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 异常消息提示类型
          errorMessageMode: 'modal',
          // 成功消息提示类型
          successMessageMode: 'success',
          // 接口地址（默认前缀）
          apiUrl: '/api',
          // 接口拼接地址前缀
          urlPrefix: '',
          //  是否加入时间戳 默认不添加时间戳
          joinTime: false,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否加密数据 1：加密 0：不加密(如果是开发环境下默认不加密，处理mock)
          encrypt: import.meta.env.MODE === 'development' ? 0 : 1,
        },
      },
      opts || {},
    ),
  );
}

// 导出http请求对象
export const HttpRequest = createAxios();
