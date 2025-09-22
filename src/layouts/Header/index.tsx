import { BellOutlined, GithubOutlined, LockOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Badge, Dropdown, FloatButton, Layout, Skeleton, Space, Tooltip } from 'antd';
import React, { useState, Suspense, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import FullScreen from './component/FullScreen';
import MessageBox from './component/MessageBox';
import UserDropdown from './component/UserDropdown';
import SearchMenuModal from './component/SearchMenuModal';
import CollapseSwitch from './component/CollapseSwitch';
import LanguageSwitch from './component/LanguageSwitch';
import BreadcrumbNavWrapper from './component/BreadcrumbNavWrapper';
import HeaderMenu from './component/HeaderMenu';
import TabBar from '@/components/TabBar';
import { usePreferencesStore } from '@/stores/store';
import './header.scss';

const Setting = React.lazy(() => import('./component/Setting'));

/**
 * 顶部布局内容
 */
const Header = () => {
  const [openSetting, setOpenSetting] = useState<boolean>(false);
  
  // 使用 useShallow 优化选择器，避免不必要的重渲染
  const { updatePreferences, headerEnable, widgetConfig } = usePreferencesStore(
    useShallow((state) => ({
      updatePreferences: state.updatePreferences,
      headerEnable: state.preferences.header.enable,
      widgetConfig: state.preferences.widget,
    }))
  );
  
  const { globalSearch, lockScreen, languageToggle, fullscreen, sidebarToggle, notification } = widgetConfig;
  const { t } = useTranslation();

  /**
   * 跳转到github
   */
  const routeGitHub = useCallback(() => {
    window.open('https://github.com/yecongling/nexus-admin', '_blank');
  }, []);

  return (
    <>
      {headerEnable ? (
        <Layout.Header
          className="ant-layout-header header-container h-auto!"
          style={{
            borderBottom: ' 1px solid #e9edf0',
            padding: 0,
          }}
        >
          {/* 第一行：主要功能区域 */}
          <div className="header-main-row">
            {/* 侧边栏切换按钮 */}
            {sidebarToggle && <CollapseSwitch />}
            {/* 面包屑 */}
            <BreadcrumbNavWrapper />
            {/* 显示头部横向的菜单 */}
            <HeaderMenu />
            <Space size="large" className="flex justify-end items-center toolbox">
              {/* 全局搜索 */}
              {globalSearch && <SearchMenuModal />}
              <Tooltip placement="bottom" title="github">
                <GithubOutlined style={{ cursor: 'pointer', fontSize: '18px' }} onClick={routeGitHub} />
              </Tooltip>
              {/* 锁屏 */}
              {lockScreen && (
                <Tooltip placement="bottom" title={t('layout.header.lock')}>
                  <LockOutlined
                    style={{ cursor: 'pointer', fontSize: '18px' }}
                    onClick={() => {
                      updatePreferences('widget', 'lockScreenStatus', true);
                    }}
                  />
                </Tooltip>
              )}
              {/* 邮件 */}
              <Badge count={5}>
                <MailOutlined style={{ cursor: 'pointer', fontSize: '18px' }} />
              </Badge>
              {/* 通知 */}
              {notification && (
                <Dropdown placement="bottom" popupRender={() => <MessageBox />}>
                  <Badge count={5}>
                    <BellOutlined style={{ cursor: 'pointer', fontSize: '18px' }} />
                  </Badge>
                </Dropdown>
              )}
              <Tooltip placement="bottomRight" title={t('layout.header.setting')}>
                <SettingOutlined style={{ cursor: 'pointer', fontSize: '18px' }} onClick={() => setOpenSetting(true)} />
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
          <div className="header-tab-row">
            <TabBar />
          </div>
        </Layout.Header>
      ) : (
        <FloatButton
          icon={<SettingOutlined />}
          tooltip={<span>{t('layout.header.setting')}</span>}
          style={{ right: 24, bottom: 24 }}
          onClick={() => setOpenSetting(true)}
        />
      )}
      {/* 系统设置界面 */}
      <Suspense fallback={<Skeleton />}>
        <Setting open={openSetting} setOpen={setOpenSetting} />
      </Suspense>
    </>
  );
};
export default memo(Header);
