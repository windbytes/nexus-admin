import {
  ApiOutlined,
  GithubOutlined,
  LockOutlined,
  LoginOutlined,
  MobileOutlined,
  SecurityScanOutlined,
  UserOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  BorderBeam,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Image,
  Input,
  type InputRef,
  Modal,
  QRCode,
  Row,
  Typography,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/icon/web/icon-512.png';
import filing from '@/assets/images/filing.png';
import { type LoginParams, type LoginResponse, loginService, type UserRole } from '@/modules/auth/api';
import RoleSelector from '@/modules/auth/components/RoleSelector';
import { commonService } from '@/shared/api/common';
import type { RoleModel } from '@/shared/api/system/role/type';
import { HttpCodeEnum } from '@/shared/constants/httpEnum';
import { useMenuStore, usePreferencesStore } from '@/shared/stores/preferences.store';
import { useTabStore } from '@/shared/stores/tab.store';
import { useUserStore } from '@/shared/stores/user.store';
import { antdUtils } from '@/shared/utils/antd';
import { copyrightYearRangeFrom } from '@/shared/utils/copyrightDisplay';
import styles from './login.module.css';

const { Text } = Typography;

const REMEMBERED_USERNAME_KEY = 'syndra_login_remembered_username';
const GH_CODE_KEY = 'syndra_github_oauth_code';

type UiLoginMode = 'password' | 'phone' | 'wechat' | 'github';

function githubRedirectUri(): string {
  return (
    import.meta.env.VITE_GITHUB_OAUTH_REDIRECT_URI ||
    `${typeof window !== 'undefined' ? window.location.origin : ''}/login/github-callback`
  );
}

function githubClientId(): string {
  return import.meta.env.VITE_GITHUB_OAUTH_CLIENT_ID || '';
}

/** WeChat 品牌绿、GitHub 品牌黑（浅底图标按钮） */
const WECHAT_BRAND_COLOR = '#07C160';
const GITHUB_BRAND_COLOR = '#181717';

/** 右侧「App 扫码」示意二维码内容，可替换为实际跳转或深链 */
const APP_SCAN_LOGIN_QR_VALUE = 'https://syndra.example.com/app-login';

/**
 * 登录模块
 * @returns 组件内容
 */
function Login() {
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
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

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
          content: <p>{message}</p>,
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
          content: (
            <>
              <p>
                {t('common.errorMsg.statusCode')}:{code}
              </p>
              <p>
                {t('common.errorMsg.reason')}:{message}
              </p>
            </>
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
        if (!cancelled) {
          setLoading(false);
        }
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

  const colors = [
    { color: '#1677ff', percent: 0 },
    { color: '#36cfc9', percent: 52 },
    { color: '#95de64', percent: 100 },
  ];

  return (
    <div className={`w-full h-full flex flex-col ${isAnimating ? styles['login-page-animated'] : ''}`}>
      <div className="h-20 flex items-center justify-start px-40">
        <div className="flex items-center">
          <img
            className={`login-icon my-0 ${isAnimating ? styles['login-icon-animated'] : ''}`}
            width="40"
            src={logo}
            alt="logo"
          />
          <span
            className="ml-5 text-3xl text-[#000000]"
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '32px',
              fontStyle: 'italic',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
              fontWeight: 700,
            }}
          >
            {t('common.app.name')}
          </span>
        </div>
      </div>
      <div className={styles['login-container']}>
        <BorderBeam color={colors} size={160} duration={8} lineWidth={2}>
          <div className={`${styles['login-box']} ${isAnimating ? styles['login-box-animated'] : ''}`}>
            <div className={styles['login-left']}>
              <div className="title mt-18">
                <p className="text-[24px] m-0 mb-2">
                  <span
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      fontWeight: 700,
                      fontSize: '30px',
                      fontStyle: 'italic',
                      color: 'rgba(0, 0, 0, 0.92)',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {t('login.description')}
                  </span>
                </p>
                <p className="text-[15px] mt-3 italic text-black/80">{t('login.heroTagline')}</p>
                <p className={styles['login-hero-intro']}>{t('login.heroIntro')}</p>
              </div>
            </div>
            <div className={styles['login-form']}>
            {showAppQrPanel ? (
              <button
                type="button"
                className={styles['login-form-corner-back']}
                onClick={() => setShowAppQrPanel(false)}
                aria-label={t('login.cornerBackForm')}
              >
                <LoginOutlined />
              </button>
            ) : (
              <button
                type="button"
                className={styles['login-form-corner-reveal']}
                onClick={openAppQrPanel}
                aria-label={t('login.cornerRevealQr')}
              >
                <span className={styles['login-form-corner__qr-wrap']} aria-hidden>
                  <span className={styles['login-form-corner__qr']}>
                    <QRCode value={APP_SCAN_LOGIN_QR_VALUE} size={128} bordered={false} />
                  </span>
                </span>
              </button>
            )}
            {!showAppQrPanel ? (
              <>
                <div className={styles['login-form-header']}>
                  <div className={styles['login-title-tabs']} role="tablist" aria-label={t('login.title')}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeMode === 'password'}
                      className={`${styles['login-title-tab']} ${activeMode === 'password' ? styles['active'] : ''}`}
                      onClick={() => selectLoginMode('password')}
                    >
                      {t('login.login')}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeMode === 'phone'}
                      className={`${styles['login-title-tab']} ${activeMode === 'phone' ? styles['active'] : ''}`}
                      onClick={() => selectLoginMode('phone')}
                    >
                      {t('login.phoneLoginTab')}
                    </button>
                  </div>
                </div>
                <div className={`${styles['login-form-main']} ${isAnimating ? styles['form-animated'] : ''}`}>
                  <Form
                    form={form}
                    name="login"
                    labelCol={{ span: 5 }}
                    size="large"
                    autoComplete="off"
                    onFinish={submit}
                    style={{ display: 'flex', flexDirection: 'column', flex: '1 1 0', minHeight: 0 }}
                  >
                    <div className={styles['login-form-body']}>
                      {activeMode === 'password' && (
                        <>
                          <Form.Item
                            name="username"
                            rules={[{ required: true, message: t('login.enterUsername') }]}
                            className={isAnimating ? styles['form-item-animated'] || '' : ''}
                          >
                            <Input
                              size="large"
                              ref={inputRef}
                              autoFocus
                              autoComplete="off"
                              allowClear
                              placeholder={`${t('login.username')}:syndra`}
                              prefix={<UserOutlined />}
                            />
                          </Form.Item>
                          <Form.Item
                            name="password"
                            rules={[{ required: true, message: t('login.enterPassword') }]}
                            className={isAnimating ? styles['form-item-animated'] || '' : ''}
                          >
                            <Input.Password
                              size="large"
                              allowClear
                              autoComplete="off"
                              placeholder={`${t('login.password')}:123456`}
                              prefix={<LockOutlined />}
                            />
                          </Form.Item>
                          <Form.Item className={isAnimating ? styles['form-item-animated'] || '' : ''}>
                            <Row gutter={8}>
                              <Col span={18}>
                                <Form.Item
                                  name="captchaCode"
                                  noStyle
                                  rules={[{ required: true, message: t('login.enterCaptcha') }]}
                                >
                                  <Input
                                    size="large"
                                    allowClear
                                    placeholder={t('login.enterCaptcha')}
                                    prefix={<SecurityScanOutlined />}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={6}>
                                <Button size="large" onClick={() => refetch()} className="w-full bg-[#f0f0f0] p-0.5!">
                                  <Image src={data?.code} preview={false} width="100%" height="100%" />
                                </Button>
                              </Col>
                            </Row>
                          </Form.Item>
                          <Form.Item
                            name="remember"
                            valuePropName="checked"
                            className={isAnimating ? styles['form-item-animated'] || '' : ''}
                          >
                            <Checkbox>{t('login.remember')}</Checkbox>
                          </Form.Item>
                        </>
                      )}

                      {activeMode === 'phone' && (
                        <>
                          <Form.Item
                            name="phone"
                            rules={[
                              { required: true, whitespace: true, message: t('login.enterPhone') },
                              { pattern: /^1\d{10}$/, message: t('login.phoneInvalid') },
                            ]}
                            className={isAnimating ? styles['form-item-animated'] || '' : ''}
                          >
                            <Input
                              ref={phoneInputRef}
                              size="large"
                              allowClear
                              placeholder={t('login.phone')}
                              prefix={<MobileOutlined />}
                            />
                          </Form.Item>
                          <Form.Item className={isAnimating ? styles['form-item-animated'] || '' : ''}>
                            <Row gutter={8}>
                              <Col span={16}>
                                <Form.Item
                                  name="smsCode"
                                  noStyle
                                  rules={[{ required: true, message: t('login.enterSmsCode') }]}
                                >
                                  <Input size="large" allowClear placeholder={t('login.smsCode')} />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Button
                                  size="large"
                                  className="w-full"
                                  disabled={smsCooldown > 0}
                                  onClick={() => void sendSms()}
                                >
                                  {smsCooldown > 0 ? `${smsCooldown}s` : t('login.sendSms')}
                                </Button>
                              </Col>
                            </Row>
                          </Form.Item>
                        </>
                      )}

                      {activeMode === 'wechat' && (
                        <div className="text-center py-4">
                          <p className="text-gray-600 mb-4">{t('login.wechatScanHint')}</p>
                          {wechatAuthorizeUrl ? (
                            <div className="flex flex-col items-center gap-4">
                              <QRCode value={wechatAuthorizeUrl} size={180} />
                              <Text type="secondary">{t('login.wechatPolling')}</Text>
                            </div>
                          ) : (
                            <Button type="primary" size="large" onClick={() => void startWeChatQr()}>
                              {t('login.wechatStartQr')}
                            </Button>
                          )}
                        </div>
                      )}

                      {activeMode === 'github' && (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-6">{t('login.githubHint')}</p>
                          <Button type="primary" size="large" icon={<GithubOutlined />} onClick={redirectGithub}>
                            {t('login.githubButton')}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className={styles['login-form-footer']}>
                      <div className={styles['login-form-submit-slot']}>
                        {(activeMode === 'password' || activeMode === 'phone') && (
                          <Form.Item className={isAnimating ? styles['form-item-animated'] || '' : ''}>
                            <Button loading={loading} size="large" className="w-full" type="primary" htmlType="submit">
                              {t('login.login')}
                            </Button>
                          </Form.Item>
                        )}
                      </div>

                      <Divider className={styles['login-other-divider']} plain>
                        {t('login.otherLoginMethods')}
                      </Divider>

                      <div className={styles['login-method-icons']}>
                        <button
                          type="button"
                          className={`${styles['login-method-icon-btn']} ${activeMode === 'wechat' ? styles['active'] : ''}`}
                          title={t('login.modeWechat')}
                          aria-label={t('login.modeWechat')}
                          onClick={() => selectLoginMode('wechat')}
                        >
                          <WechatOutlined style={{ color: WECHAT_BRAND_COLOR, fontSize: 22 }} />
                        </button>
                        <button
                          type="button"
                          className={`${styles['login-method-icon-btn']} ${activeMode === 'github' ? styles['active'] : ''}`}
                          title={t('login.modeGithub')}
                          aria-label={t('login.modeGithub')}
                          onClick={() => selectLoginMode('github')}
                        >
                          <GithubOutlined style={{ color: GITHUB_BRAND_COLOR, fontSize: 22 }} />
                        </button>
                      </div>
                    </div>
                  </Form>
                </div>
              </>
            ) : (
              <div key={appQrAnimKey} className={`${styles['login-app-qr-layout']} ${styles['login-app-qr-enter']}`}>
                <div className={styles['login-app-qr-center']}>
                  <div className={styles['login-app-qr-frame']}>
                    <QRCode value={APP_SCAN_LOGIN_QR_VALUE} size={220} errorLevel="H" />
                    <span className={styles['login-app-qr-icon']} aria-hidden>
                      <ApiOutlined />
                    </span>
                  </div>
                  <Text type="secondary" className="mt-3 text-center max-w-[280px]">
                    {t('login.appQrHint')}
                  </Text>
                </div>
                <Divider className={styles['login-other-divider']} plain>
                  {t('login.otherLoginMethods')}
                </Divider>
                <div className={styles['login-method-icons']}>
                  <button
                    type="button"
                    className={`${styles['login-method-icon-btn']} ${activeMode === 'wechat' ? styles['active'] : ''}`}
                    title={t('login.modeWechat')}
                    aria-label={t('login.modeWechat')}
                    onClick={() => selectLoginMode('wechat')}
                  >
                    <WechatOutlined style={{ color: WECHAT_BRAND_COLOR, fontSize: 22 }} />
                  </button>
                  <button
                    type="button"
                    className={`${styles['login-method-icon-btn']} ${activeMode === 'github' ? styles['active'] : ''}`}
                    title={t('login.modeGithub')}
                    aria-label={t('login.modeGithub')}
                    onClick={() => selectLoginMode('github')}
                  >
                    <GithubOutlined style={{ color: GITHUB_BRAND_COLOR, fontSize: 22 }} />
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </BorderBeam>
      </div>
      <div className={styles['login-footer']}>
        <Text className={styles['copyright'] || ''}>
          Copyright@{copyrightYearRangeFrom()} 499475142@qq.com All Rights Reserved
        </Text>
        <div className={styles['filing-info']}>
          <a
            target="_blank"
            rel="noreferrer"
            href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=51012202001944"
            className={styles['filing-link']}
          >
            <img src={filing} alt="备案图标" />
            <Text className={styles['filing-text'] || ''}>川公网安备51012202001944</Text>
          </a>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className={styles['icp-link']}>
            <Text className={styles['icp-text'] || ''}>蜀ICP备2023022276号-3</Text>
          </a>
        </div>
      </div>

      <Modal
        title="选择角色"
        open={showRoleSelector}
        closable={false}
        mask={{
          closable: false,
        }}
        footer={null}
        width={600}
        centered
      >
        {userRoles.length > 0 && <RoleSelector roles={userRoles} onSelect={handleRoleSelect} loading={loading} />}
      </Modal>
    </div>
  );
}
export default Login;

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
