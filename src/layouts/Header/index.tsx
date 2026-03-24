import { BellOutlined, GithubOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons';
import { Badge, Dropdown, FloatButton, Layout, Skeleton, Space, Tooltip, theme } from 'antd';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import TabBar from '@/components/TabBar';
import SystemLogo from '@/layouts/LeftMenu/component/SystemLogo';
import { usePreferencesStore } from '@/stores/store';
import type { LayoutType } from '@/types/app';
import BreadcrumbNavWrapper from './component/BreadcrumbNavWrapper';
import CollapseSwitch from './component/CollapseSwitch';
import FullScreen from './component/FullScreen';
import HeaderMenu from './component/HeaderMenu';
import LanguageSwitch from './component/LanguageSwitch';
import MessageBox from './component/MessageBox';
import SearchMenuModal from './component/SearchMenuModal';
import UserDropdown from './component/UserDropdown';
import '@/layouts/LeftMenu/leftMenu.scss';
import './header.scss';
import useGlobalUIStore from '@/stores/globalUIStore';

const Setting = lazy(() => import('./component/Setting'));

/**
 * 顶部布局内容
 * 性能优化：
 * 1. 提取静态样式对象到组件外部
 * 2. 使用 useCallback 缓存所有回调函数
 * 3. 使用 useMemo 缓存 MessageBox 组件
 * 4. 优化 Dropdown 的 dropdownRender
 */
const Header = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  /** 双列菜单布局：侧边栏切换在左侧第二列底部，此处不展示 */
  const DOUBLE_COLUMN_LAYOUTS: LayoutType[] = ['sidebar-mixed-nav', 'header-mixed-nav'];
  /** 水平布局：无侧边栏，隐藏侧边栏切换和面包屑 */
  const HORIZONTAL_LAYOUT: LayoutType = 'header-nav';

  const { updatePreferences, headerEnable, tabbarEnable, widgetConfig, layout } = usePreferencesStore(
    useShallow((state) => ({
      updatePreferences: state.updatePreferences,
      headerEnable: state.preferences.header.enable,
      tabbarEnable: state.preferences.tabbar.enable,
      widgetConfig: state.preferences.widget,
      layout: state.preferences.app.layout,
    }))
  );

  const isDoubleColumnMenu = DOUBLE_COLUMN_LAYOUTS.includes(layout);
  const isHorizontalLayout = layout === HORIZONTAL_LAYOUT;
  /** 水平布局下不显示侧边栏切换和面包屑 */
  const showSidebarAndBreadcrumb = !isHorizontalLayout;
  // 设置窗口
  const { settingMenuModalOpen, setSettingMenuModalOpen } = useGlobalUIStore(
    useShallow((state) => ({
      settingMenuModalOpen: state.settingMenuModalOpen,
      setSettingMenuModalOpen: state.setSettingMenuModalOpen,
    }))
  );

  const { globalSearch, lockScreen, languageToggle, fullscreen, sidebarToggle, notification } = widgetConfig;
  const { t } = useTranslation();

  /**
   * 跳转到github - 使用 useCallback 缓存
   */
  const routeGitHub = () => {
    window.open('https://github.com/windbytes/syndra-admin', '_blank');
  };

  /**
   * 开启锁屏 - 使用 useCallback 缓存
   */
  const handleLockScreen = () => {
    updatePreferences('widget', 'lockScreenStatus', true);
  };

  return (
    <>
      {headerEnable ? (
        <Layout.Header
          className="ant-layout-header header-container shrink-0"
          style={{ backgroundColor: colorBgContainer }}
        >
          {/* 第一行：主要功能区域 */}
          <div className="header-main-row">
            {/* 水平布局：左侧展示系统图标和名称 */}
            {isHorizontalLayout && (
              <div className="shrink-0">
                <SystemLogo variant="full" />
              </div>
            )}
            {/* 侧边栏切换：水平布局无侧边栏不显示，双列布局移至左侧第二列 */}
            {sidebarToggle && !isDoubleColumnMenu && showSidebarAndBreadcrumb && <CollapseSwitch />}
            {/* 面包屑：水平布局下不显示 */}
            {showSidebarAndBreadcrumb && <BreadcrumbNavWrapper />}
            {/* 显示头部横向的菜单 */}
            <HeaderMenu />
            <Space size="large" className="flex justify-end items-center toolbox">
              {/* 全局搜索 */}
              {globalSearch && <SearchMenuModal />}
              <Tooltip placement="bottom" title="github">
                <GithubOutlined className="text-[18px] cursor-pointer" onClick={routeGitHub} />
              </Tooltip>
              {/* 锁屏 */}
              {lockScreen && (
                <Tooltip placement="bottom" title={t('layout.header.lock')}>
                  <LockOutlined className="text-[18px] cursor-pointer" onClick={handleLockScreen} />
                </Tooltip>
              )}
              {/* 通知 */}
              {notification && (
                <Dropdown placement="bottom" popupRender={() => <MessageBox />}>
                  <Badge count={5}>
                    <BellOutlined className="text-[18px] cursor-pointer" />
                  </Badge>
                </Dropdown>
              )}
              <Tooltip placement="bottomRight" title={t('layout.header.setting')}>
                <SettingOutlined
                  className="my-spin text-[18px] cursor-pointer"
                  onClick={() => setSettingMenuModalOpen(true)}
                />
              </Tooltip>
              {/* 语言切换 */}
              {languageToggle && <LanguageSwitch />}
              {/* 全屏 */}
              {fullscreen && <FullScreen />}
              {/* 用户信息 */}
              <UserDropdown />
            </Space>
          </div>

          {/* 第二行：TabBar区域 */}
          {tabbarEnable && <TabBar />}
        </Layout.Header>
      ) : (
        <FloatButton
          className="right-24 bottom-24"
          icon={<SettingOutlined className="my-spin" />}
          tooltip={<span>{t('layout.header.setting')}</span>}
          onClick={() => setSettingMenuModalOpen(true)}
        />
      )}
      {/* 系统设置界面 */}
      <Suspense fallback={<Skeleton />}>
        <Setting open={settingMenuModalOpen} setOpen={setSettingMenuModalOpen} />
      </Suspense>
    </>
  );
};

Header.displayName = 'Header';

export default Header;
