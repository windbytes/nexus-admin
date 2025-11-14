/**
 * axios中对数据的中转处理
 */
/* 数据处理 */
import { HttpCodeEnum, RequestEnum } from '@/enums/httpEnum';
import { commonService } from '@/services/common';
import { useUserStore } from '@/stores/userStore';
import type { RequestOptions } from '@/types/axios';
import type { Response } from '@/types/global';
import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { t } from 'i18next';
import type React from 'react';
import { HttpRequest } from '.';
import { antdUtils } from '../antdUtil';
import { encrypt } from '../encrypt';
import { isString } from '../is';
import { setObjToUrlParams } from '../utils';
import { joinTimestamp } from './helper';

// 标记是否正在刷新token
let isRefreshing = false;
// 存储等待的请求
interface RefreshSubscriber {
  resolve: () => void;
  reject: (error: unknown) => void;
}

let refreshSubscribers: RefreshSubscriber[] = [];

function onTokenRefreshed() {
  for (const subscriber of refreshSubscribers) {
    subscriber.resolve();
  }
  refreshSubscribers = [];
}

function onTokenRefreshFailed(error: unknown) {
  for (const subscriber of refreshSubscribers) {
    subscriber.reject(error);
  }
  refreshSubscribers = [];
}

function addSubscriber(subscriber: RefreshSubscriber) {
  refreshSubscribers.push(subscriber);
}

export interface CreateAxiosOptions extends AxiosRequestConfig {
  authenticationScheme?: string;
  transform?: AxiosTransform;
  requestOptions?: RequestOptions;
  // 标记是否正在重试获取访问token
  _retry?: boolean;
}

/**
 * 封装一些需要进行数据转换或处理的配置
 */
export abstract class AxiosTransform {
  /**
   * @description: Process configuration before request
   */
  beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig;

  /**
   * 响应数据转换
   */
  transformResponseHook?: (res: AxiosResponse<Response>, options: RequestOptions) => any;

  /**
   * @description: 请求失败处理
   */
  requestCatchHook?: (e: Error | AxiosError, options: RequestOptions) => Promise<any>;

  /**
   * @description: 请求之前的拦截器
   */
  requestInterceptors?: (config: InternalAxiosRequestConfig, options: CreateAxiosOptions) => InternalAxiosRequestConfig;

  /**
   * @description: 请求之后的拦截器
   */
  responseInterceptors?: (res: AxiosResponse<any>) => any;

  /**
   * @description: 请求之前的拦截器错误处理
   */
  requestInterceptorsCatch?: (error: Error) => void;

  /**
   * @description: 请求之后的拦截器错误处理
   */
  responseInterceptorsCatch?: (error: Error) => void;
}

/**
 * 定义一些拦截器的具体实现
 */
export const transform: AxiosTransform = {
  /**
   * 处理响应数据
   * @param res
   * @param options
   */
  transformResponseHook: (res: AxiosResponse<Response>, options: RequestOptions) => {
    const { isTransformResponse, isReturnNativeResponse } = options;
    // 是否返回原生响应头
    if (isReturnNativeResponse) {
      return res;
    }
    // 不进行任何处理，直接返回响应数据
    if (!isTransformResponse) {
      return res.data;
    }
    // 错误的时候返回
    const { data } = res;
    if (!data) {
      throw new Error(t('common.errorMsg.noData'));
    }
    const { code, data: rtn, message: msg } = data;
    // 系统默认200状态码为正常成功请求，可在枚举中配置自己的
    const hasSuccess = data && Reflect.has(data, 'code') && code === HttpCodeEnum.SUCCESS;
    if (hasSuccess) {
      if (msg && options.successMessageMode === 'success') {
        // 信息成功提示
        antdUtils.message?.success(msg);
      }
      return rtn;
    }
    if (options.errorMessageMode === 'modal') {
      antdUtils.modal?.error({
        title: `${t('common.errorMsg.serverException')},${t('common.errorMsg.statusCode')}(${code})`,
        content: msg,
        okText: t('common.operation.confirm'),
      });
    } else if (options.errorMessageMode === 'message') {
      antdUtils.message?.error(msg);
    }
    throw new Error(msg || t('common.errorMsg.requestFailed'));
  },

  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    const { apiUrl, joinPrefix, joinParamsToUrl, joinTime = true, urlPrefix } = options;
    if (joinPrefix) {
      config.url = `${urlPrefix}${config.url}`;
    }
    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`;
    }
    const params = config.params || {};
    const data = config.data || false;
    if (config.method?.toUpperCase() === RequestEnum.GET || config.method?.toUpperCase() === RequestEnum.DELETE) {
      if (!isString(params)) {
        // 给get请求加上事件戳参数，避免从缓存中拿数据
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false));
      } else {
        // 兼容restful风格
        config.url = `${config.url + params}${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
      }
    } else {
      if (!isString(params)) {
        if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
          config.data = data;
          config.params = params;
        } else {
          // 非get请求如果没有提供data，则将params视为data
          config.data = params;
          config.params = undefined;
        }
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(config.url as string, Object.assign({}, config.params, config.data));
        }
      } else {
        // 兼容restful风格
        config.url = config.url + params;
        config.params = undefined;
      }
    }
    return config;
  },

  /**
   * 请求拦截器处理
   * @param config
   * @param options
   */
  requestInterceptors: (config, options) => {
    config.headers = config.headers || {};
    const cpt = options?.requestOptions?.encrypt;
    // 进行数据加密
    if (config.data && cpt === 1) {
      // 判定json数据需要转为json字符串才能加密
      if (
        typeof config.data === 'object' &&
        (config.headers['Content-Type'] === 'application/json' ||
          config.headers['Content-Type'] === 'application/json;charset=UTF-8')
      ) {
        config.data = JSON.stringify(config.data);
        // 并且修改axios内部的transformRequest(不然如果传的json，加密后axios会默认转json字符串，后台接收到的会多双引号)
        config.transformRequest = (data) => data;
      }
      const result = encrypt(config.data);
      config.data = result.data;
      // 将秘钥放到请求头里面
      config.headers['X-Encrypted-Key'] = result.key;
    }
    // 将加密配置放到请求头里面
    config.headers['X-Encrypted'] = cpt;
    return config;
  },

  /**
   * 请求失败后处理（如502网关错误）
   *
   * @param error 错误信息
   * @param options 请求配置
   */
  requestCatchHook: (error: Error | AxiosError) => {
    const code = (error as AxiosError).status;
    let errMessage = '';
    if (code === HttpCodeEnum.RC502) {
      errMessage = t('common.errorMsg.requestFailed');
    } else if (code === HttpCodeEnum.RC500) {
      errMessage = `${t('common.errorMsg.serverException')},${t('common.errorMsg.retry')}`;
    }
    if (errMessage) {
      antdUtils.modal?.error({
        title: `${t('common.errorMsg.serverException')},${t('common.errorMsg.statusCode')}(${code})`,
        content: errMessage,
        okText: t('common.operation.confirm'),
      });
    }
    return Promise.reject(error);
  },

  /**
   * 响应拦截器处理
   * @param res
   */
  responseInterceptors: async (res: AxiosResponse) => {
    const userStore = useUserStore.getState();
    const config = res.config;

    // 处理下载请求（responseType为blob）的错误响应
    // 当后端返回错误时，全局异常拦截器会返回 JSON 格式的错误信息
    if (config.responseType === 'blob' && res.data instanceof Blob) {
      const contentType = res.headers['content-type'] || '';
      const contentDisposition = res.headers['content-disposition'] || '';

      // 判断是否为错误响应：Content-Type 是 JSON 且没有 Content-Disposition
      // 正常文件下载会有 Content-Disposition 头
      const isErrorResponse = contentType.includes('application/json') && !contentDisposition;

      if (isErrorResponse) {
        try {
          // 将 Blob 转换为文本，解析错误信息
          const text = await res.data.text();
          const errorData = JSON.parse(text);

          // 构造标准的错误响应，让后续的错误处理逻辑能够捕获
          const error: any = new Error(errorData.message || '操作失败');
          error.response = {
            data: errorData,
            status: res.status,
            statusText: res.statusText,
            headers: res.headers,
            config: res.config,
          };
          error.status = res.status;
          return Promise.reject(error);
        } catch (e) {
          // JSON 解析失败
          if (e instanceof SyntaxError) {
            const error: any = new Error('服务器返回了无效的响应格式');
            error.response = res;
            return Promise.reject(error);
          }
          return Promise.reject(e);
        }
      }
    }

    const result = res.data;
    const { code: responseCode } = result;
    // 判断是否跳过请求
    const axiosConfig = config as CreateAxiosOptions;
    const requestOptions = axiosConfig.requestOptions ?? {};

    if (requestOptions?.skipAuthInterceptor && responseCode === HttpCodeEnum.RC401) {
      antdUtils.modal?.confirm({
        title: t('login.loginValid'),
        content: t('login.retryLogin'),
        onOk() {
          userStore.logout();
          window.location.href = '/login';
        },
        okText: t('common.operation.confirm'),
      });
      return Promise.reject(t('login.loginValid'));
    }
    // 判断responseCode是否为401(即token失效),添加_retry属性防止重复刷新token
    if (responseCode === HttpCodeEnum.RC401 && !axiosConfig._retry) {
      axiosConfig._retry = true;
      // 判断是否正在刷新token
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // 调用刷新token的接口
          await commonService.refreshToken();
          // 执行等待的请求
          onTokenRefreshed();
          // 重新发起原始请求(这里需要注意一点的是，内部的url可能是有前缀的，所以需要把前缀去掉)
          if (config.url?.startsWith('/api')) {
            config.url = config.url.slice(4);
          }
          const response = await HttpRequest.request(
            { ...config },
            { ...requestOptions, isReturnNativeResponse: true }
          );
          return response;
        } catch (refreshError) {
          onTokenRefreshFailed(refreshError);
          // 刷新 token 失败，跳转登录页
          antdUtils.modal?.confirm({
            title: t('login.loginValid'),
            content: t('login.retryLogin'),
            onOk() {
              userStore.logout();
              window.location.href = '/login';
            },
            okText: t('common.operation.confirm'),
          });
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 正在刷新token，将请求加入队列
        return new Promise((resolve, reject) => {
          addSubscriber({
            resolve: () => {
              // 重新发起原始请求
              if (config.url?.startsWith('/api')) {
                config.url = config.url.slice(4);
              }
              HttpRequest.request({ ...config }, { ...requestOptions, isReturnNativeResponse: true })
                .then(resolve)
                .catch(reject);
            },
            reject: (error) => {
              reject(error);
            },
          });
        });
      }
    }
    return res;
  },

  /**
   * 响应错误处理(这种是针对后端服务有响应的，比如404之类的)，这里需要放过401的请求，让其走到上面的token续期操作里面
   * @param error
   */
  responseInterceptorsCatch: (error: any) => {
    const err: string = error?.toString?.() ?? '';
    const result = error.response?.data ?? {};
    const status = error.status;
    const { code: responseCode, message: responseMessage } = result;

    const { code, message } = error || {};
    let errMessage: string | React.ReactNode = '';
    if ((status === 404 || responseCode === HttpCodeEnum.RC404) && (responseMessage || message)) {
      errMessage = (
        <>
          <div>错误信息：{responseMessage || message}</div>
          <div>请求路径：{error.config.url}</div>
        </>
      );
    } else if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
      errMessage = t('common.errorMsg.requestTimeout');
    } else if (err?.includes('Network Error')) {
      errMessage = t('common.errorMsg.networkException');
    } else if (responseCode !== HttpCodeEnum.RC401 && (responseMessage || message)) {
      errMessage = responseMessage || message;
    }

    if (errMessage) {
      antdUtils.modal?.error({
        title: `${t('common.errorMsg.serverException')}（${t('common.errorMsg.statusCode')}：${responseCode || code}）`,
        content: errMessage,
        okText: t('common.operation.confirm'),
      });
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
};
