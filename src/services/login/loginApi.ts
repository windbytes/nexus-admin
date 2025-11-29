import type { Response } from '@/types/global';
import { HttpRequest } from '@/utils/request';

/**
 * 登录请求参数
 */
export interface LoginParams {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 验证码 */
  captcha: string;
  /** 验证码key */
  checkKey: string;
  /** 记住密码 */
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
  /** 首页路径 */
  homePath?: string;
  /** 用户角色列表 */
  userRoles: UserRole[];
}

/**
 * 枚举登录需要的接口地址
 */
const LoginApi = {
  /**
   * 登录
   */
  login: '/login',
  /**
   * 获取验证码
   */
  getCode: '/getCaptcha',
};

/**
 * 登录服务接口
 */
interface ILoginService {
  /**
   * 登录
   * @param params 登录参数
   * @returns 登录结果
   */
  login(params: LoginParams): Promise<Response>;

  /**
   * 获取验证码
   * @returns 验证码
   */
  getCaptcha(): Promise<{ key: string; code: any }>;
}

/**
 * 登录服务实现
 */
export const loginService: ILoginService = {
  /**
   * 登录
   * @param params 登录参数
   * @returns 登录结果
   */
  login(params: LoginParams): Promise<Response> {
    return HttpRequest.post<Response>(
      {
        url: LoginApi.login,
        data: params,
      },
      { isTransformResponse: false }
    );
  },

  /**
   * 获取验证码
   * @param checkKey 验证码key
   * @returns 验证码
   */
  async getCaptcha(): Promise<{ key: string; code: any }> {
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
};
