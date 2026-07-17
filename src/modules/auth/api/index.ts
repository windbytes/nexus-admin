import { HttpRequest } from '@/shared/utils/request';
import type { Response } from '@/types/global';

/**
 * 认证模块 API
 *
 * 封装登录 / 角色确认 / 验证码 / 短信验证码 / 微信扫码 / GitHub OAuth 等接口请求。
 */

/** 与后端 {@code LoginMethod} 一致 */
export type LoginMethodType = 'PASSWORD' | 'PHONE_SMS' | 'GITHUB' | 'WECHAT_QR';

/**
 * 登录请求参数（按登录方式选填；{@code remember} 仅前端使用，不会提交后端）
 */
export interface LoginParams {
  loginMethod?: LoginMethodType;
  username?: string;
  password?: string;
  roleCode?: string;
  captchaKey?: string;
  captchaCode?: string;
  phone?: string;
  smsCode?: string;
  oauthCode?: string;
  oauthRedirectUri?: string;
  wechatCode?: string;
  remember?: boolean;
}

/**
 * 用户角色信息
 */
export interface UserRole {
  /** 角色ID */
  id: string;
  /** 角色名称 */
  roleName: string;
  /** 角色Code */
  roleCode: string;
  /** 角色类型 */
  roleType: string;
  /** 角色描述 */
  remark?: string;
  /** 角色状态 */
  status: boolean;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  /** 用户ID */
  userId: string;
  /** 用户名 */
  username: string;
  /** 访问令牌 */
  accessToken: string;
  /** 首页路径 */
  homePath?: string;
  /** 用户角色列表 */
  userRoles: UserRole[];
}

/** 微信扫码会话 */
export interface WeChatQrStartData {
  ticket: string;
  authorizeUrl: string;
}

export interface WeChatPollData {
  status: string;
  wechatCode?: string;
}

const LoginApi = {
  login: '/auth/login',
  confirmRole: '/auth/confirm-role',
  getCode: '/sys/framework/captcha',
  smsSend: '/auth/sms/send',
  wechatQr: '/auth/oauth/wechat/qrcode',
  wechatPoll: '/auth/oauth/wechat/poll',
};

interface ILoginService {
  login(params: LoginParams): Promise<Response>;
  confirmRole(loginToken: string, roleCode: string): Promise<{ accessToken: string; permissions: string[] }>;
  getCaptcha(): Promise<{ key: string; code: string }>;
  sendLoginSms(phone: string): Promise<void>;
  startWeChatQr(): Promise<WeChatQrStartData>;
  pollWeChatQr(ticket: string): Promise<WeChatPollData>;
}

export const loginService: ILoginService = {
  login(params: LoginParams): Promise<Response> {
    const { remember: _remember, ...data } = params;
    return HttpRequest.post<Response>(
      {
        url: LoginApi.login,
        data,
      },
      { isTransformResponse: false }
    );
  },

  async confirmRole(loginToken: string, roleCode: string): Promise<{ accessToken: string; permissions: string[] }> {
    return HttpRequest.post<{ accessToken: string; permissions: string[] }>(
      {
        url: LoginApi.confirmRole,
        data: { loginToken, roleCode },
      },
      { successMessageMode: 'none' }
    );
  },

  async getCaptcha(): Promise<{ key: string; code: string }> {
    const key = Date.now().toString();
    const code = await HttpRequest.get(
      {
        url: `${LoginApi.getCode}/${key}`,
      },
      {
        successMessageMode: 'none',
      }
    );
    return { key, code };
  },

  async sendLoginSms(phone: string): Promise<void> {
    await HttpRequest.post(
      {
        url: LoginApi.smsSend,
        data: { phone },
      },
      { successMessageMode: 'none' }
    );
  },

  async startWeChatQr(): Promise<WeChatQrStartData> {
    return HttpRequest.get<WeChatQrStartData>(
      {
        url: LoginApi.wechatQr,
      },
      { successMessageMode: 'none' }
    );
  },

  async pollWeChatQr(ticket: string): Promise<WeChatPollData> {
    return HttpRequest.get<WeChatPollData>(
      {
        url: LoginApi.wechatPoll,
        params: { ticket },
      },
      { successMessageMode: 'none' }
    );
  },
};
