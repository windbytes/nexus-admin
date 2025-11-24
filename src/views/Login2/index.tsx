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
      const selectedRole = rolesToUse.find(role => role.id === roleId);
      if (!selectedRole) {
        antdUtils.message?.error('选择的角色不存在');
        return;
      }

       // 更新用户存储
      userStore.login(currentLoginData.username, selectedRole.id, selectedRole.roleCode);
      userStore.setCurrentRoleId(roleId);
      // 将UserRole转换为RoleModel格式
      const roleModels = rolesToUse.map(role => ({
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
      updatePreferences("widget", "lockScreenStatus", false);
      
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
    navigate({ to: '/login' });
  };

  return (
    <div className={`${styles['login-page']} ${isAnimating ? styles['animate'] : ''}`}>
      {/* 背景装饰 */}
      <div className={styles['background-decoration']}>
        <div className={styles['floating-circle']} style={{ "--delay": "0s" } as React.CSSProperties}></div>
        <div className={styles['floating-circle']} style={{ "--delay": "2s" } as React.CSSProperties}></div>
        <div className={styles['floating-circle']} style={{ "--delay": "4s" } as React.CSSProperties}></div>
        <div className={styles['floating-circle']} style={{ "--delay": "6s" } as React.CSSProperties}></div>
      </div>

      {/* 顶部Logo */}
      <div className={styles['login-header']}>
        <div className={styles['logo-container']}>
          <div className={styles['app-icon']}>
            <img src={logo} alt="logo" />
            <div className={styles['icon-glow']}></div>
          </div>
          <Text className={styles['app-name'] || ""}>{t('common.app.name')}</Text>
        </div>
        {/* 切换登录样式按钮 */}
        <Button
          type="text"
          icon={<SwapOutlined />}
          onClick={switchLoginStyle}
          className={styles['switch-btn'] || ""}
          title="切换到传统登录界面"
        />
      </div>

      {/* 主要内容区域 */}
      <div className={styles['login-container']}>
        <div className={styles['login-card']}>
          {/* 左侧信息面板 */}
          <div className={styles['info-panel']}>
            <div className={styles['info-content']}>
              <div className={styles['platform-title']}>
                <Text className={styles['platform-name'] || ""}>{t('login.description')}</Text>
                <Text className={styles['platform-subtitle'] || ""}>FLEX AND STRONG</Text>
              </div>
              <div className={styles['platform-illustration']}>
                {/* 这里可以放置原有的插图或新的装饰元素 */}
                <div className={styles['illustration-placeholder']}>
                  <div className={styles['laptop-icon']}>
                    <div className={styles['screen']}></div>
                    <div className={styles['keyboard']}></div>
                  </div>
                  <div className={styles['floating-elements']}>
                    <div className={styles['element']}></div>
                    <div className={styles['element']}></div>
                    <div className={styles['element']}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧登录表单 */}
          <div className={styles['form-panel']}>
            <div className={styles['form-content']}>
              <div className={styles['form-header']}>
                <LockOutlined className={styles['login-icon']} />
                <Text className={styles['login-title'] || ""}>{t('login.login')}</Text>
              </div>

              <Form 
                form={form} 
                name="login" 
                size="large" 
                autoComplete="off" 
                onFinish={submit}
                className={styles['login-form']}
              >
                <Form.Item name="username" rules={[{ required: true, message: t('login.enterUsername') }]}>
                  <div className={styles['input-wrapper']}>
                    <UserOutlined className={styles['input-icon']} />
                    <Input
                      ref={inputRef}
                      autoFocus
                      autoComplete="off"
                      allowClear
                      placeholder={`${t('login.username')}:nexus`}
                      className={styles['form-input']}
                    />
                  </div>
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: t('login.enterPassword') }]}>
                  <div className={styles['input-wrapper']}>
                    <LockOutlined className={styles['input-icon']} />
                    <Input.Password
                      allowClear
                      autoComplete="off"
                      placeholder={`${t('login.password')}:123456`}
                      className={styles['form-input']}
                    />
                  </div>
                </Form.Item>

                <Form.Item>
                  <Row gutter={12}>
                    <Col span={16}>
                      <Form.Item name="captcha" noStyle rules={[{ required: true, message: t('login.enterCaptcha') }]}>
                        <div className={styles['input-wrapper']}>
                          <SecurityScanOutlined className={styles['input-icon']} />
                          <Input
                            allowClear
                            placeholder={t('login.enterCaptcha')}
                            className={styles['form-input']}
                          />
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Button 
                        size="large" 
                        onClick={refreshCaptcha} 
                        className={styles['captcha-btn'] || ""}
                      >
                        <Image src={data?.code} preview={false} width="100%" height="100%" />
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>

                <Form.Item name="remember" valuePropName="checked" className={styles['remember-item'] || ""}>
                  <Checkbox className={styles['remember-checkbox'] || ""}>
                    <Text className={styles['remember-text'] || ""}>{t('login.remember')}</Text>
                  </Checkbox>
                </Form.Item>

                <Form.Item className={styles['submit-item'] || ""}>
                  <Button 
                    loading={loading} 
                    size="large" 
                    className={styles['login-btn'] || ""} 
                    type="primary" 
                    htmlType="submit"
                  >
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
        <Text className={styles['copyright'] || ""}>Copyright@2025 499475142@qq.com All Rights Reserved</Text>
        <div className={styles['filing-info']}>
          <a
            target="_blank"
            rel="noreferrer"
            href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=51012202001944"
            className={styles['filing-link']}
          >
            <img src={filing} alt="备案图标" />
            <Text className={styles['filing-text'] || ""}>川公网安备51012202001944</Text>
          </a>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className={styles['icp-link']}
          >
            <Text className={styles['icp-text'] || ""}>蜀ICP备2023022276号-2</Text>
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
        className={styles['role-modal'] || ""}
      >
        {userRoles.length > 0 && (
          <RoleSelector
            roles={userRoles}
            onSelect={handleRoleSelect}
            loading={loading}
          />
        )}
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
