import { Layout, theme } from 'antd';
import type React from 'react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import { usePreferencesStore } from '@/stores/store';
import MenuComponent from './component/MenuComponent';
import SystemLogo from './component/SystemLogo';
import './leftMenu.scss';

/**
 * 左边的菜单栏
 */
const LeftMenu: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { sidebar, mode, semiDarkSidebar } = usePreferencesStore(
    useShallow((state) => ({
      sidebar: state.preferences.sidebar,
      mode: state.preferences.theme.mode,
      semiDarkSidebar: state.preferences.theme.semiDarkSidebar,
    }))
  );

  const finalMode = useMemo(() => {
    let currentMode = mode;
    if (currentMode === 'auto') {
      const isDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      currentMode = isDarkMode ? 'dark' : 'light';
    }
    if (semiDarkSidebar) {
      currentMode = 'dark';
    }
    return currentMode;
  }, [mode, semiDarkSidebar]);

  return (
    <Layout.Sider
      className="nexus-layout-sider"
      trigger={null}
      collapsedWidth={64}
      style={{ backgroundColor: finalMode === 'dark' ? 'var(--ant-layout-sider-bg)' : colorBgContainer }}
      collapsible
      width={sidebar.width}
      theme={finalMode}
      collapsed={sidebar.collapsed}
    >
      <SystemLogo />
      <MenuComponent />
    </Layout.Sider>
  );
};

LeftMenu.displayName = 'LeftMenu';

export default LeftMenu;
