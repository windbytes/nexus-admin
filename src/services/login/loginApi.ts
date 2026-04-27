import type { Response } from '@/types/global';
import { HttpRequest } from '@/utils/request';

/** 与后端 {@code LoginMethod} 一致 */
export type LoginMethodType = 'PASSWORD' | 'PHONE_SMS' | 'GITHUB' | 'WECHAT_QR';

/**
 * 登录请求参数（按登录方式选填；{@code remember} 仅前端使用，不会提交后端）
 */
export interface LoginParams {
  loginMethod?: LoginMethodType;
  tenantId?: string;
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
  rememberTenant?: boolean;
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
  /** 租户ID */
  tenantId?: string;
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

export interface LoginTenantOption {
  tenantId: string;
  tenantCode?: string;
  tenantName?: string;
}

const LoginApi = {
  login: '/auth/login',
  queryTenants: '/auth/tenants',
  confirmRole: '/auth/confirm-role',
  getCode: '/sys/framework/captcha',
  smsSend: '/auth/sms/send',
  wechatQr: '/auth/oauth/wechat/qrcode',
  wechatPoll: '/auth/oauth/wechat/poll',
};

interface ILoginService {
  login(params: LoginParams): Promise<Response>;
  queryLoginTenants(account: string, loginMethod?: LoginMethodType): Promise<LoginTenantOption[]>;
  confirmRole(loginToken: string, roleCode: string): Promise<{ accessToken: string; permissions: string[] }>;
  getCaptcha(): Promise<{ key: string; code: string }>;
  sendLoginSms(phone: string, tenantId?: string): Promise<void>;
  startWeChatQr(tenantId?: string): Promise<WeChatQrStartData>;
  pollWeChatQr(ticket: string, tenantId?: string): Promise<WeChatPollData>;
}

export const loginService: ILoginService = {
  login(params: LoginParams): Promise<Response> {
    const { remember: _remember, rememberTenant: _rememberTenant, ...data } = params;
    return HttpRequest.post<Response>(
      {
        url: LoginApi.login,
        data,
      },
      { isTransformResponse: false }
    );
  },

  async queryLoginTenants(account: string, loginMethod?: LoginMethodType): Promise<LoginTenantOption[]> {
    return HttpRequest.get<LoginTenantOption[]>(
      {
        url: LoginApi.queryTenants,
        params: { account, loginMethod },
      },
      { successMessageMode: 'none', errorMessageMode: 'none' }
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

  async sendLoginSms(phone: string, tenantId?: string): Promise<void> {
    await HttpRequest.post(
      {
        url: LoginApi.smsSend,
        data: { phone, tenantId },
      },
      { successMessageMode: 'none' }
    );
  },

  async startWeChatQr(tenantId?: string): Promise<WeChatQrStartData> {
    return HttpRequest.get<WeChatQrStartData>(
      {
        url: LoginApi.wechatQr,
        params: { tenantId },
      },
      { successMessageMode: 'none' }
    );
  },

  async pollWeChatQr(ticket: string, tenantId?: string): Promise<WeChatPollData> {
    return HttpRequest.get<WeChatPollData>(
      {
        url: LoginApi.wechatPoll,
        params: { ticket, tenantId },
      },
      { successMessageMode: 'none' }
    );
  },
};
