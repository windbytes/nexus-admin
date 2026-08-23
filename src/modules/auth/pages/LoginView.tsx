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
import { BorderBeam, Button, Checkbox, Col, Divider, Form, Image, Input, Modal, QRCode, Row, Typography } from 'antd';
import type { TFunction } from 'i18next';
import logo from '@/assets/icon/web/icon-512.png';
import filing from '@/assets/images/filing.png';
import RoleSelector from '@/modules/auth/components/RoleSelector';
import { copyrightYearRangeFrom } from '@/shared/utils/copyrightDisplay';
import styles from './login.module.css';
import type { LoginPageViewModel, UiLoginMode } from './useLoginPage';

const { Text } = Typography;

const WECHAT_BRAND_COLOR = '#07C160';
const GITHUB_BRAND_COLOR = '#181717';
const APP_SCAN_LOGIN_QR_VALUE = 'https://syndra.example.com/app-login';

type BorderBeamColor = { color: string; percent: number };

export type LoginViewProps = LoginPageViewModel & {
  borderBeamColors: BorderBeamColor[];
};

function LoginPageHeader({ t, isAnimating }: { t: TFunction; isAnimating: boolean }) {
  return (
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
  );
}

function LoginHero({ t }: { t: TFunction }) {
  return (
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
  );
}

function LoginFormCorner({
  showAppQrPanel,
  onOpenAppQr,
  onCloseAppQr,
  t,
}: {
  showAppQrPanel: boolean;
  onOpenAppQr: () => void;
  onCloseAppQr: () => void;
  t: TFunction;
}) {
  if (showAppQrPanel) {
    return (
      <button
        type="button"
        className={styles['login-form-corner-back']}
        onClick={onCloseAppQr}
        aria-label={t('login.cornerBackForm')}
      >
        <LoginOutlined />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles['login-form-corner-reveal']}
      onClick={onOpenAppQr}
      aria-label={t('login.cornerRevealQr')}
    >
      <span className={styles['login-form-corner__qr-wrap']} aria-hidden>
        <span className={styles['login-form-corner__qr']}>
          <QRCode value={APP_SCAN_LOGIN_QR_VALUE} size={128} bordered={false} />
        </span>
      </span>
    </button>
  );
}

function PasswordLoginFields({
  t,
  isAnimating,
  inputRef,
  captchaCode,
  onRefreshCaptcha,
}: {
  t: TFunction;
  isAnimating: boolean;
  inputRef: LoginPageViewModel['inputRef'];
  captchaCode?: string;
  onRefreshCaptcha: () => void;
}) {
  const animClass = isAnimating ? styles['form-item-animated'] || '' : '';

  return (
    <>
      <Form.Item name="username" rules={[{ required: true, message: t('login.enterUsername') }]} className={animClass}>
        <Input
          size="large"
          ref={inputRef}
          autoFocus
          autoComplete="off"
          allowClear
          placeholder={t('login.username')}
          prefix={<UserOutlined />}
        />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: t('login.enterPassword') }]} className={animClass}>
        <Input.Password
          size="large"
          allowClear
          autoComplete="off"
          placeholder={t('login.password')}
          prefix={<LockOutlined />}
        />
      </Form.Item>
      <CaptchaRow t={t} animClass={animClass} captchaCode={captchaCode} onRefreshCaptcha={onRefreshCaptcha} />
      <Form.Item
        name="remember"
        valuePropName="checked"
        className={`${styles['login-remember']} ${animClass}`.trim()}
      >
        <Checkbox>{t('login.remember')}</Checkbox>
      </Form.Item>
    </>
  );
}

function CaptchaRow({
  t,
  animClass,
  captchaCode,
  onRefreshCaptcha,
}: {
  t: TFunction;
  animClass: string;
  captchaCode?: string;
  onRefreshCaptcha: () => void;
}) {
  return (
    <Form.Item className={animClass}>
      <Row gutter={8}>
        <Col span={18}>
          <Form.Item name="captchaCode" noStyle rules={[{ required: true, message: t('login.enterCaptcha') }]}>
            <Input size="large" allowClear placeholder={t('login.enterCaptcha')} prefix={<SecurityScanOutlined />} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Button size="large" onClick={onRefreshCaptcha} className="w-full bg-[#f0f0f0] p-0.5!">
            <Image src={captchaCode} preview={false} width="100%" height="100%" />
          </Button>
        </Col>
      </Row>
    </Form.Item>
  );
}

function PhoneLoginFields({
  t,
  isAnimating,
  phoneInputRef,
  smsCooldown,
  onSendSms,
}: {
  t: TFunction;
  isAnimating: boolean;
  phoneInputRef: LoginPageViewModel['phoneInputRef'];
  smsCooldown: number;
  onSendSms: () => void;
}) {
  const animClass = isAnimating ? styles['form-item-animated'] || '' : '';

  return (
    <>
      <Form.Item
        name="phone"
        rules={[
          { required: true, whitespace: true, message: t('login.enterPhone') },
          { pattern: /^1\d{10}$/, message: t('login.phoneInvalid') },
        ]}
        className={animClass}
      >
        <Input ref={phoneInputRef} size="large" allowClear placeholder={t('login.phone')} prefix={<MobileOutlined />} />
      </Form.Item>
      <SmsCodeRow t={t} animClass={animClass} smsCooldown={smsCooldown} onSendSms={onSendSms} />
    </>
  );
}

function SmsCodeRow({
  t,
  animClass,
  smsCooldown,
  onSendSms,
}: {
  t: TFunction;
  animClass: string;
  smsCooldown: number;
  onSendSms: () => void;
}) {
  return (
    <Form.Item className={animClass}>
      <Row gutter={8}>
        <Col span={16}>
          <Form.Item name="smsCode" noStyle rules={[{ required: true, message: t('login.enterSmsCode') }]}>
            <Input size="large" allowClear placeholder={t('login.smsCode')} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Button size="large" className="w-full" disabled={smsCooldown > 0} onClick={() => void onSendSms()}>
            {smsCooldown > 0 ? `${smsCooldown}s` : t('login.sendSms')}
          </Button>
        </Col>
      </Row>
    </Form.Item>
  );
}

function WechatLoginPanel({
  t,
  wechatAuthorizeUrl,
  onStartWeChatQr,
}: {
  t: TFunction;
  wechatAuthorizeUrl: string | null;
  onStartWeChatQr: () => void;
}) {
  return (
    <div className="text-center py-4">
      <p className="text-gray-600 mb-4">{t('login.wechatScanHint')}</p>
      {wechatAuthorizeUrl ? (
        <div className="flex flex-col items-center gap-4">
          <QRCode value={wechatAuthorizeUrl} size={180} />
          <Text type="secondary">{t('login.wechatPolling')}</Text>
        </div>
      ) : (
        <Button type="primary" size="large" onClick={() => void onStartWeChatQr()}>
          {t('login.wechatStartQr')}
        </Button>
      )}
    </div>
  );
}

function GithubLoginPanel({ t, onRedirectGithub }: { t: TFunction; onRedirectGithub: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-6">{t('login.githubHint')}</p>
      <Button type="primary" size="large" icon={<GithubOutlined />} onClick={onRedirectGithub}>
        {t('login.githubButton')}
      </Button>
    </div>
  );
}

function LoginMethodIcons({
  activeMode,
  onSelectMode,
  t,
}: {
  activeMode: UiLoginMode;
  onSelectMode: (mode: UiLoginMode) => void;
  t: TFunction;
}) {
  return (
    <div className={styles['login-method-icons']}>
      <button
        type="button"
        className={`${styles['login-method-icon-btn']} ${activeMode === 'wechat' ? styles['active'] : ''}`}
        title={t('login.modeWechat')}
        aria-label={t('login.modeWechat')}
        onClick={() => onSelectMode('wechat')}
      >
        <WechatOutlined style={{ color: WECHAT_BRAND_COLOR, fontSize: 22 }} />
      </button>
      <button
        type="button"
        className={`${styles['login-method-icon-btn']} ${activeMode === 'github' ? styles['active'] : ''}`}
        title={t('login.modeGithub')}
        aria-label={t('login.modeGithub')}
        onClick={() => onSelectMode('github')}
      >
        <GithubOutlined style={{ color: GITHUB_BRAND_COLOR, fontSize: 22 }} />
      </button>
    </div>
  );
}

function LoginFormFooter({
  t,
  isAnimating,
  activeMode,
  loading,
  onSelectMode,
}: {
  t: TFunction;
  isAnimating: boolean;
  activeMode: UiLoginMode;
  loading: boolean;
  onSelectMode: (mode: UiLoginMode) => void;
}) {
  const animClass = isAnimating ? styles['form-item-animated'] || '' : '';
  const showSubmit = activeMode === 'password' || activeMode === 'phone';

  return (
    <div className={styles['login-form-footer']}>
      <div className={styles['login-form-submit-slot']}>
        {showSubmit && (
          <Form.Item className={`${styles['login-submit']} ${animClass}`.trim()}>
            <Button loading={loading} size="large" className="w-full" type="primary" htmlType="submit">
              {t('login.login')}
            </Button>
          </Form.Item>
        )}
      </div>
      <Divider className={styles['login-other-divider']} plain>
        {t('login.otherLoginMethods')}
      </Divider>
      <LoginMethodIcons activeMode={activeMode} onSelectMode={onSelectMode} t={t} />
    </div>
  );
}

function LoginModeTabs({
  t,
  activeMode,
  onSelectMode,
}: {
  t: TFunction;
  activeMode: UiLoginMode;
  onSelectMode: (mode: UiLoginMode) => void;
}) {
  return (
    <div className={styles['login-form-header']}>
      <div className={styles['login-title-tabs']} role="tablist" aria-label={t('login.title')}>
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'password'}
          className={`${styles['login-title-tab']} ${activeMode === 'password' ? styles['active'] : ''}`}
          onClick={() => onSelectMode('password')}
        >
          {t('login.login')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'phone'}
          className={`${styles['login-title-tab']} ${activeMode === 'phone' ? styles['active'] : ''}`}
          onClick={() => onSelectMode('phone')}
        >
          {t('login.phoneLoginTab')}
        </button>
      </div>
    </div>
  );
}

function AppQrPanel({
  t,
  appQrAnimKey,
  activeMode,
  onSelectMode,
}: {
  t: TFunction;
  appQrAnimKey: number;
  activeMode: UiLoginMode;
  onSelectMode: (mode: UiLoginMode) => void;
}) {
  return (
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
      <LoginMethodIcons activeMode={activeMode} onSelectMode={onSelectMode} t={t} />
    </div>
  );
}

function LoginPageFooter() {
  return (
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
  );
}

function RoleSelectorModal({
  showRoleSelector,
  userRoles,
  loading,
  onRoleSelect,
}: {
  showRoleSelector: boolean;
  userRoles: LoginPageViewModel['userRoles'];
  loading: boolean;
  onRoleSelect: LoginPageViewModel['handleRoleSelect'];
}) {
  return (
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
      {userRoles.length > 0 && <RoleSelector roles={userRoles} onSelect={onRoleSelect} loading={loading} />}
    </Modal>
  );
}

function LoginFormPanel(props: LoginViewProps) {
  const {
    t,
    form,
    inputRef,
    phoneInputRef,
    loading,
    isAnimating,
    activeMode,
    showAppQrPanel,
    setShowAppQrPanel,
    appQrAnimKey,
    smsCooldown,
    wechatAuthorizeUrl,
    captchaData,
    refetchCaptcha,
    startWeChatQr,
    redirectGithub,
    sendSms,
    submit,
    selectLoginMode,
    openAppQrPanel,
  } = props;

  return (
    <div className={styles['login-form']}>
      <LoginFormCorner
        showAppQrPanel={showAppQrPanel}
        onOpenAppQr={openAppQrPanel}
        onCloseAppQr={() => setShowAppQrPanel(false)}
        t={t}
      />
      {!showAppQrPanel ? (
        <>
          <LoginModeTabs t={t} activeMode={activeMode} onSelectMode={selectLoginMode} />
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
                  <PasswordLoginFields
                    t={t}
                    isAnimating={isAnimating}
                    inputRef={inputRef}
                    captchaCode={captchaData?.code}
                    onRefreshCaptcha={() => refetchCaptcha()}
                  />
                )}
                {activeMode === 'phone' && (
                  <PhoneLoginFields
                    t={t}
                    isAnimating={isAnimating}
                    phoneInputRef={phoneInputRef}
                    smsCooldown={smsCooldown}
                    onSendSms={sendSms}
                  />
                )}
                {activeMode === 'wechat' && (
                  <WechatLoginPanel t={t} wechatAuthorizeUrl={wechatAuthorizeUrl} onStartWeChatQr={startWeChatQr} />
                )}
                {activeMode === 'github' && <GithubLoginPanel t={t} onRedirectGithub={redirectGithub} />}
              </div>
              <LoginFormFooter
                t={t}
                isAnimating={isAnimating}
                activeMode={activeMode}
                loading={loading}
                onSelectMode={selectLoginMode}
              />
            </Form>
          </div>
        </>
      ) : (
        <AppQrPanel t={t} appQrAnimKey={appQrAnimKey} activeMode={activeMode} onSelectMode={selectLoginMode} />
      )}
    </div>
  );
}

export function LoginView(props: LoginViewProps) {
  const { t, isAnimating, borderBeamColors, showRoleSelector, userRoles, loading, handleRoleSelect } = props;

  return (
    <div className={`w-full h-full flex flex-col ${isAnimating ? styles['login-page-animated'] : ''}`}>
      <LoginPageHeader t={t} isAnimating={isAnimating} />
      <div className={styles['login-container']}>
        <BorderBeam color={borderBeamColors} size={160} duration={8} lineWidth={2}>
          <div className={`${styles['login-box']} ${isAnimating ? styles['login-box-animated'] : ''}`}>
            <LoginHero t={t} />
            <LoginFormPanel {...props} />
          </div>
        </BorderBeam>
      </div>
      <LoginPageFooter />
      <RoleSelectorModal
        showRoleSelector={showRoleSelector}
        userRoles={userRoles}
        loading={loading}
        onRoleSelect={handleRoleSelect}
      />
    </div>
  );
}
