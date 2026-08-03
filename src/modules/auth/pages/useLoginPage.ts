import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Form, type InputRef } from 'antd';
import { createElement, Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type LoginParams, type LoginResponse, loginService, type UserRole } from '@/modules/auth/api';
import { commonService } from '@/shared/api/common';
import type { RoleModel } from '@/shared/api/system/role/type';
import { HttpCodeEnum } from '@/shared/constants/httpEnum';
import { useMenuStore, usePreferencesStore } from '@/shared/stores/preferences.store';
import { useTabStore } from '@/shared/stores/tab.store';
import { useUserStore } from '@/shared/stores/user.store';
import { antdUtils } from '@/shared/utils/antd';

const REMEMBERED_USERNAME_KEY = 'syndra_login_remembered_username';
const GH_CODE_KEY = 'syndra_github_oauth_code';

export type UiLoginMode = 'password' | 'phone' | 'wechat' | 'github';

function githubRedirectUri(): string {
  return (
    import.meta.env.VITE_GITHUB_OAUTH_REDIRECT_URI ||
    `${typeof window !== 'undefined' ? window.location.origin : ''}/login/github-callback`
  );
}

function githubClientId(): string {
  return import.meta.env.VITE_GITHUB_OAUTH_CLIENT_ID || '';
}

function findMenuByRoute(menus: unknown[]): unknown | null {
  for (const menu of menus) {
    if (menu && typeof menu === 'object' && 'route' in menu && (menu as { route?: unknown }).route) {
      return menu;
    }
    if (menu && typeof menu === 'object' && 'children' in menu) {
      const children = (menu as { children: unknown[] }).children;
      const found = findMenuByRoute(children);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function useLoginPage() {
  const [form] = Form.useForm();
  const inputRef = useRef(null);
  const phoneInputRef = useRef<InputRef>(null);
  const navigate = useNavigate();
  const { setMenus, setButtonPermissions } = useMenuStore();
  const userStore = useUserStore();
  const { resetTabs } = useTabStore();
  const { t } = useTranslation();
  const { updatePreferences } = usePreferencesStore();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState<boolean>(false);
  const [showRoleSelector, setShowRoleSelector] = useState<boolean>(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const loginData = useRef<LoginResponse | null>(null);
  const [isAnimating] = useState<boolean>(true);

  const [activeMode, setActiveMode] = useState<UiLoginMode>(() => {
    try {
      return sessionStorage.getItem(GH_CODE_KEY) ? 'github' : 'password';
    } catch {
      return 'password';
    }
  });
  const [showAppQrPanel, setShowAppQrPanel] = useState(false);
  const [appQrAnimKey, setAppQrAnimKey] = useState(0);
  const [smsCooldown, setSmsCooldown] = useState(0);
  const [wechatAuthorizeUrl, setWechatAuthorizeUrl] = useState<string | null>(null);
  const [wechatTicket, setWechatTicket] = useState<string | null>(null);
  const handleLoginApiResultRef = useRef<
    (
      code: number,
      loginResponse: LoginResponse | undefined,
      message: string,
      rememberOpts?: { remember?: boolean; username?: string }
    ) => Promise<void>
  >(() => Promise.resolve());

  const { data, refetch } = useQuery<{ key: string; code: string }>({
    queryKey: ['getCode'],
    queryFn: loginService.getCaptcha,
    enabled: activeMode === 'password',
  });

  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem(REMEMBERED_USERNAME_KEY);
      if (savedUsername?.trim()) {
        form.setFieldsValue({ username: savedUsername.trim(), remember: true });
      }
    } catch {
      // ignore
    }
  }, [form]);

  useEffect(() => {
    if (!wechatTicket) {
      return;
    }

    const pollId = window.setInterval(async () => {
      try {
        const poll = await loginService.pollWeChatQr(wechatTicket);
        if (poll.status === 'DONE' && poll.wechatCode) {
          setWechatTicket(null);
          setLoading(true);
          try {
            const {
              code,
              data: loginResponse,
              message,
            } = await loginService.login({
              loginMethod: 'WECHAT_QR',
              wechatCode: poll.wechatCode,
            });
            await handleLoginApiResultRef.current(code, loginResponse as LoginResponse, message);
          } finally {
            setLoading(false);
          }
        } else if (poll.status === 'EXPIRED') {
          setWechatTicket(null);
          antdUtils.message?.warning(t('login.wechatSessionExpired'));
        }
      } catch {
        // 轮询失败时保持静默，下一轮重试
      }
    }, 2000);

    return () => window.clearInterval(pollId);
  }, [wechatTicket, t]);

  useEffect(() => {
    if (smsCooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setSmsCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [smsCooldown]);

  useEffect(() => {
    if (activeMode !== 'phone') {
      return;
    }
    const timer = window.setTimeout(() => phoneInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [activeMode]);

  const handleRoleSelect = async (roleId: string, roleData?: UserRole[], loginResponseData?: LoginResponse) => {
    const currentLoginData = loginResponseData || loginData.current;
    if (!currentLoginData) {
      return;
    }

    try {
      setLoading(true);

      const rolesToUse = roleData || userRoles;

      const selectedRole = rolesToUse.find((role) => role.id === roleId);
      if (!selectedRole) {
        antdUtils.message?.error('选择的角色不存在');
        return;
      }
      const { accessToken, permissions } = await loginService.confirmRole(
        currentLoginData.accessToken,
        selectedRole.roleCode
      );
      userStore.login(currentLoginData.username, selectedRole.id, selectedRole.roleCode, accessToken);
      userStore.setRoleId(roleId);
      const roleModels: RoleModel[] = rolesToUse.map((role) => ({
        id: role.id,
        roleCode: role.roleCode,
        roleName: role.roleName,
        roleType: role.roleType,
        status: role.status,
        remark: role.remark || '',
      }));
      userStore.setUserRoles(roleModels);

      resetTabs();

      const menu = await commonService.getMenuListByRoleId(roleId);
      setMenus(menu);
      queryClient.setQueryData(['menuData', roleId], menu);
      const buttonPermissions = permissions;
      setButtonPermissions(buttonPermissions);
      queryClient.setQueryData(['buttonPermissions', roleId], buttonPermissions);
      let homePath = currentLoginData.homePath;
      if (!homePath) {
        const firstRoute = findMenuByRoute(menu as unknown[]);
        if (firstRoute && typeof firstRoute === 'object') {
          const fr = firstRoute as { path?: unknown; route?: unknown };
          if (typeof fr.path === 'string') {
            homePath = fr.path;
          } else if (typeof fr.route === 'string') {
            homePath = fr.route;
          }
        }
        if (!homePath) {
          antdUtils.notification?.error({
            title: t('login.loginFail'),
            description: '没有配置默认首页地址，也没有菜单，请联系管理员！',
          });
          return;
        }
      }

      if (!homePath) {
        antdUtils.notification?.error({
          title: t('login.loginFail'),
          description: '无法确定首页路径！',
        });
        return;
      }

      userStore.setHomePath(homePath);

      setShowRoleSelector(false);

      updatePreferences('widget', 'lockScreenStatus', false);

      antdUtils.notification?.success({
        title: t('login.loginSuccess'),
        description: t('login.welcome'),
      });

      navigate({ to: homePath });
    } catch (error) {
      console.error('角色选择失败:', error);
      antdUtils.message?.error('角色选择失败');
    } finally {
      setLoading(false);
    }
  };

  async function processLoginSuccess(loginResponse: LoginResponse, rememberedUsername?: string, remember?: boolean) {
    if (remember !== undefined) {
      if (remember && rememberedUsername?.trim()) {
        localStorage.setItem(REMEMBERED_USERNAME_KEY, rememberedUsername.trim());
      } else if (!remember) {
        localStorage.removeItem(REMEMBERED_USERNAME_KEY);
      }
    }

    loginData.current = loginResponse;

    if (!loginResponse.userRoles || loginResponse.userRoles.length === 0) {
      antdUtils.modal?.error({
        title: '登录失败',
        content: '您的账户没有分配任何角色，请联系管理员配置角色权限！',
        onOk: () => {
          refetch();
        },
      });
      return;
    }
    if (loginResponse.userRoles.length === 1) {
      const [role] = loginResponse.userRoles;
      if (role) {
        await handleRoleSelect(role.id, loginResponse.userRoles, loginResponse);
      }
    } else {
      setUserRoles(loginResponse.userRoles);
      setShowRoleSelector(true);
    }
  }

  async function handleLoginApiResult(
    code: number,
    loginResponse: LoginResponse | undefined,
    message: string,
    rememberOpts?: { remember?: boolean; username?: string }
  ) {
    switch (code) {
      case HttpCodeEnum.RC107:
      case HttpCodeEnum.RC102:
        form.setFields([{ name: 'username', errors: [message] }]);
        form.getFieldInstance('username')?.focus();
        refetch();
        break;
      case HttpCodeEnum.RC108:
        form.setFields([{ name: 'password', errors: [message] }]);
        form.getFieldInstance('password')?.focus();
        refetch();
        break;
      case HttpCodeEnum.RC300:
      case HttpCodeEnum.RC301:
        form.setFields([{ name: 'captchaCode', errors: [message] }]);
        form.getFieldInstance('captchaCode')?.focus();
        refetch();
        break;
      case HttpCodeEnum.RC111:
        antdUtils.message?.error({
          content: createElement('p', null, message),
        });
        break;
      case HttpCodeEnum.SUCCESS:
        if (loginResponse) {
          await processLoginSuccess(loginResponse, rememberOpts?.username, rememberOpts?.remember);
        }
        break;
      default:
        antdUtils.modal?.error({
          title: t('login.loginFail'),
          content: createElement(
            Fragment,
            null,
            createElement('p', null, `${t('common.errorMsg.statusCode')}:${code}`),
            createElement('p', null, `${t('common.errorMsg.reason')}:${message}`)
          ),
        });
        refetch();
        break;
    }
  }

  useEffect(() => {
    handleLoginApiResultRef.current = handleLoginApiResult;
  });

  useEffect(() => {
    let cancelled = false;

    const runGithubOAuthLogin = async (code: string) => {
      setLoading(true);
      try {
        const {
          code: httpCode,
          data: loginResponse,
          message,
        } = await loginService.login({
          loginMethod: 'GITHUB',
          oauthCode: code,
          oauthRedirectUri: githubRedirectUri(),
        });
        if (!cancelled) {
          await handleLoginApiResultRef.current(httpCode, loginResponse as LoginResponse, message);
        }
      } finally {
        setLoading(false);
      }
    };

    try {
      const code = sessionStorage.getItem(GH_CODE_KEY);
      if (!code) {
        return () => {
          cancelled = true;
        };
      }
      sessionStorage.removeItem(GH_CODE_KEY);
      void runGithubOAuthLogin(code);
    } catch {
      // ignore
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const startWeChatQr = async () => {
    try {
      const { ticket, authorizeUrl } = await loginService.startWeChatQr();
      setWechatAuthorizeUrl(authorizeUrl);
      setWechatTicket(ticket);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('login.wechatQrUnavailable');
      antdUtils.message?.error(msg);
    }
  };

  const redirectGithub = () => {
    const id = githubClientId();
    if (!id) {
      antdUtils.message?.warning(t('login.githubNotConfigured'));
      return;
    }
    const redirect = encodeURIComponent(githubRedirectUri());
    const url = `https://github.com/login/oauth/authorize?client_id=${id}&redirect_uri=${redirect}&scope=read:user`;
    window.location.assign(url);
  };

  const sendSms = async () => {
    try {
      const { phone: phoneRaw } = await form.validateFields(['phone']);
      const phone = String(phoneRaw ?? '').trim();
      try {
        await loginService.sendLoginSms(phone);
        antdUtils.message?.success(t('login.smsSent'));
        setSmsCooldown(60);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : t('login.smsSendFail');
        antdUtils.message?.error(msg);
      }
    } catch {
      /* validateFields 失败时由 Form.Item 展示校验信息 */
    }
  };

  const submit = async (values: LoginParams) => {
    setLoading(true);
    try {
      if (activeMode === 'password') {
        values.captchaKey = data?.key || '';
        values.loginMethod = 'PASSWORD';
        const { code, data: loginResponse, message } = await loginService.login(values);
        await handleLoginApiResult(code, loginResponse as LoginResponse, message, {
          remember: values.remember,
          username: values.username,
        });
      } else if (activeMode === 'phone') {
        const {
          code,
          data: loginResponse,
          message,
        } = await loginService.login({
          loginMethod: 'PHONE_SMS',
          phone: values.phone,
          smsCode: values.smsCode,
        });
        await handleLoginApiResult(code, loginResponse as LoginResponse, message);
      }
    } finally {
      setLoading(false);
    }
  };

  const setMode = (mode: UiLoginMode) => {
    setActiveMode(mode);
    form.resetFields();
    setWechatAuthorizeUrl(null);
    setWechatTicket(null);
    if (mode === 'password') {
      try {
        const savedUsername = localStorage.getItem(REMEMBERED_USERNAME_KEY);
        if (savedUsername?.trim()) {
          form.setFieldsValue({ username: savedUsername.trim(), remember: true });
        }
      } catch {
        // ignore
      }
    }
  };

  const selectLoginMode = (mode: UiLoginMode) => {
    setShowAppQrPanel(false);
    setMode(mode);
  };

  const openAppQrPanel = () => {
    setAppQrAnimKey((k) => k + 1);
    setShowAppQrPanel(true);
  };

  return {
    form,
    inputRef,
    phoneInputRef,
    t,
    loading,
    showRoleSelector,
    userRoles,
    isAnimating,
    activeMode,
    showAppQrPanel,
    setShowAppQrPanel,
    appQrAnimKey,
    smsCooldown,
    wechatAuthorizeUrl,
    captchaData: data,
    refetchCaptcha: refetch,
    handleRoleSelect,
    startWeChatQr,
    redirectGithub,
    sendSms,
    submit,
    selectLoginMode,
    openAppQrPanel,
  };
}

export type LoginPageViewModel = ReturnType<typeof useLoginPage>;
