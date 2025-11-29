import filing from '@/assets/images/filing.png';
import logo from '@/assets/images/icon-512.png';
import { loginService, type LoginParams, type LoginResponse, type UserRole } from '@/services/login/loginApi';
import { LockOutlined, SecurityScanOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { Button, Checkbox, Col, Form, Image, Input, Modal, Row, Typography } from 'antd';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './login.module.css';
// 一些公用的API需要提取出来到api目录下(后续进行更改)
import RoleSelector from '@/components/RoleSelector';
import { HttpCodeEnum } from '@/enums/httpEnum';
import { commonService } from '@/services/common';
import { useMenuStore, usePreferencesStore } from '@/stores/store';
import { useTabStore } from '@/stores/tabStore';
import { useUserStore } from '@/stores/userStore';
import { antdUtils } from '@/utils/antdUtil';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

/**
 * 登录模块
 * @returns 组件内容
 */
const Login: React.FC = () => {
  const [form] = Form.useForm();
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { setMenus } = useMenuStore();
  const userStore = useUserStore();
  const { resetTabs } = useTabStore();
  const { t } = useTranslation();
  const { updatePreferences } = usePreferencesStore();
  const queryClient = useQueryClient();

  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 角色选择相关状态
  const [showRoleSelector, setShowRoleSelector] = useState<boolean>(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loginData, setLoginData] = useState<LoginResponse | null>(null);
  // 动画状态
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // 验证码
  const { data, refetch } = useQuery<{ key: string; code: any }>({
    queryKey: ['getCode'],
    queryFn: loginService.getCaptcha,
  });

  // 页面加载时启动动画
  useEffect(() => {
    setIsAnimating(true);
  }, []);

  /**
   * 处理角色选择
   */
  const handleRoleSelect = async (roleId: string, roleData?: UserRole[], loginResponseData?: LoginResponse) => {
    // 使用传入的loginResponseData或当前状态中的loginData
    const currentLoginData = loginResponseData || loginData;
    if (!currentLoginData) return;

    try {
      setLoading(true);

      // 使用传入的角色数据或当前状态中的角色数据
      const rolesToUse = roleData || userRoles;

      // 查找选中的角色
      const selectedRole = rolesToUse.find((role) => role.id === roleId);
      if (!selectedRole) {
        antdUtils.message?.error('选择的角色不存在');
        return;
      }
      // 更新用户存储
      userStore.login(currentLoginData.username, selectedRole.id, selectedRole.roleCode);
      userStore.setCurrentRoleId(roleId);
      // 将UserRole转换为RoleModel格式
      const roleModels = rolesToUse.map((role) => ({
        id: role.id,
        roleCode: role.roleType, // 使用roleType作为roleCode
        roleName: role.roleName,
        roleType: role.roleType,
        status: role.status,
        remark: role.remark || '',
      }));
      userStore.setUserRoles(roleModels);

      // 清空缓存
      resetTabs();

      // 获取角色对应的菜单
      const menu = await commonService.getMenuListByRoleId(roleId);
      setMenus(menu);
      queryClient.setQueryData(['menuData', roleId], menu);

      // 确定首页路径
      let homePath = currentLoginData.homePath;
      if (!homePath) {
        const firstRoute = findMenuByRoute(menu);
        if (firstRoute) {
          homePath = (firstRoute as any).path;
        } else {
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

      // 关闭角色选择弹窗
      setShowRoleSelector(false);

      // 直接解锁屏幕
      updatePreferences('widget', 'lockScreenStatus', false);

      antdUtils.notification?.success({
        title: t('login.loginSuccess'),
        description: t('login.welcome'),
      });

      // 跳转到首页
      navigate({ to: homePath });
    } catch (error) {
      console.error('角色选择失败:', error);
      antdUtils.message?.error('角色选择失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 登录表单提交
   * @param values 提交表单的数据
   */
  const submit = async (values: LoginParams) => {
    // 加入验证码校验key
    values.checkKey = data?.key || '';
    setLoading(true);

    try {
      const { code, data: loginResponse, message } = await loginService.login(values);

      // 根据code判定登录状态（和枚举的状态码进行判定） 只会存在几种情况，用户名不存在，用户名或密码错误，用户名冻结，验证码错误或者过期
      // case中使用{}包裹的目的是为了保证变量做用于仅限于case块
      switch (code) {
        // 用户名不存在或禁用
        case HttpCodeEnum.RC107:
        case HttpCodeEnum.RC102:
          form.setFields([{ name: 'username', errors: [message] }]);
          form.getFieldInstance('username').focus();
          // 刷新验证码
          refetch();
          break;
        // 密码输入错误
        case HttpCodeEnum.RC108:
          form.setFields([{ name: 'password', errors: [message] }]);
          form.getFieldInstance('password').focus();
          // 刷新验证码
          refetch();
          break;
        // 验证码错误或过期
        case HttpCodeEnum.RC300:
        case HttpCodeEnum.RC301:
          form.setFields([{ name: 'captcha', errors: [message] }]);
          form.getFieldInstance('captcha').focus();
          // 刷新验证码
          refetch();
          break;
        // 登录失败次数过多
        case HttpCodeEnum.RC111:
          antdUtils.message?.error({
            content: <p>{message}</p>,
          });
          break;
        // 登录成功
        case HttpCodeEnum.SUCCESS:
          {
            // 保存登录数据
            setLoginData(loginResponse);

            // 检查角色信息
            if (!loginResponse.userRoles || loginResponse.userRoles.length === 0) {
              // 没有角色信息，提示错误
              antdUtils.modal?.error({
                title: '登录失败',
                content: '您的账户没有分配任何角色，请联系管理员配置角色权限！',
                onOk: () => {
                  // 刷新验证码
                  refetch();
                },
              });
              return;
            } else if (loginResponse.userRoles.length === 1) {
              // 单角色情况，直接登录
              const role = loginResponse.userRoles[0];
              await handleRoleSelect(role.id, loginResponse.userRoles, loginResponse);
            } else {
              // 多角色情况，显示角色选择界面
              setUserRoles(loginResponse.userRoles);
              setShowRoleSelector(true);
            }
          }
          break;
        default:
          // 默认按登录失败处理
          antdUtils.modal?.error({
            title: t('login.loginFail'),
            content: (
              <>
                <p>
                  {t('common.statusCode')}:{code}
                </p>
                <p>
                  {t('common.reason')}:{message}
                </p>
              </>
            ),
          });
          // 刷新验证码
          refetch();
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新验证码
   */
  const refreshCaptcha = () => {
    refetch();
  };

  /**
   * 切换到另一个登录界面
   */
  const switchLoginStyle = () => {
    navigate({ to: '/login2' });
  };

  return (
    <div className={`w-full h-full flex flex-col ${isAnimating ? styles['login-page-animated'] : ''}`}>
      {/* 标题 */}
      <div className="h-[80px] flex items-center justify-between px-40">
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
        {/* 切换登录样式按钮 */}
        <Button
          type="text"
          icon={<SwapOutlined />}
          onClick={switchLoginStyle}
          className={styles['switch-btn-traditional'] || ''}
          title="切换到现代登录界面"
        />
      </div>
      <div className={styles['login-container']}>
        <div className={`${styles['login-box']} ${isAnimating ? styles['login-box-animated'] : ''}`}>
          {/* 左边图案和标题 */}
          <div className={styles['login-left']}>
            <div className="title mt-18">
              <p className="text-[24px] m-0 mb-2">
                <span
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 700,
                    fontSize: '28px',
                    fontStyle: 'italic',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {t('login.description')}
                </span>
              </p>
              <p className="text-[14px] mt-3 italic">FLEX AND STRONG</p>
            </div>
          </div>
          {/* 右边登陆表单 */}
          <div className={styles['login-form']}>
            <div className="login-title">
              <p className="text-[28px] text-center m-0">
                <span className="font-bold">{t('login.login')}</span>
              </p>
            </div>
            <div className={`form ${isAnimating ? styles['form-animated'] : ''}`} style={{ marginTop: '40px' }}>
              <Form form={form} name="login" labelCol={{ span: 5 }} size="large" autoComplete="off" onFinish={submit}>
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
                    placeholder={`${t('login.username')}:nexus`}
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
                      <Form.Item name="captcha" noStyle rules={[{ required: true, message: t('login.enterCaptcha') }]}>
                        <Input
                          size="large"
                          allowClear
                          placeholder={t('login.enterCaptcha')}
                          prefix={<SecurityScanOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Button size="large" onClick={refreshCaptcha} className="w-full bg-[#f0f0f0] p-0.5!">
                        <Image src={data?.code} preview={false} width="100%" height="100%" />
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
                {/* 记住密码 */}
                <Form.Item
                  name="remember"
                  valuePropName="checked"
                  className={isAnimating ? styles['form-item-animated'] || '' : ''}
                >
                  <Checkbox>{t('login.remember')}</Checkbox>
                </Form.Item>
                <Form.Item className={isAnimating ? styles['form-item-animated'] || '' : ''}>
                  <Button loading={loading} size="large" className="w-full" type="primary" htmlType="submit">
                    {t('login.login')}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
      {/* 底部版权信息 */}
      <div className={styles['login-footer']}>
        <Text className={styles['copyright'] || ''}>Copyright@2025 499475142@qq.com All Rights Reserved</Text>
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
            <Text className={styles['icp-text'] || ''}>蜀ICP备2023022276号-2</Text>
          </a>
        </div>
      </div>

      {/* 角色选择弹窗 */}
      <Modal
        title="选择角色"
        open={showRoleSelector}
        closable={false}
        maskClosable={false}
        footer={null}
        width={600}
        centered
      >
        {userRoles.length > 0 && <RoleSelector roles={userRoles} onSelect={handleRoleSelect} loading={loading} />}
      </Modal>
    </div>
  );
};
export default Login;

/**
 * 递归查找菜单(返回第一个匹配的菜单)
 * @param menus 菜单数组
 * @param key 要查找的菜单的 key
 * @returns 找到的菜单对象或 null
 */
function findMenuByRoute(menus: any[]): any | null {
  for (const menu of menus) {
    if (menu.route) {
      return menu; // 找到匹配的菜单项
    }
    if (menu.children) {
      const found = findMenuByRoute(menu.children);
      if (found) return found; // 递归查找子菜单
    }
  }
  return null;
}
