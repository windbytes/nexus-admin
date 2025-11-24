import { Layout, theme } from 'antd';
import type React from 'react';
import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import { usePreferencesStore } from '@/stores/store';
import MenuComponent from './component/MenuComponent';
import SystemLogo from './component/SystemLogo';
import './leftMenu.scss';

// 提取静态样式对象到组件外部
const siderStyles = {
  overflow: 'hidden',
  position: 'relative',
  transition: 'width .2s cubic-bezier(.34,.69,.1,1)',
  zIndex: 999,
  borderRight: '1px solid #00000012',
} as const;

/**
 * 左边的菜单栏
 */
const LeftMenu: React.FC = memo(() => {
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
      className='nexus-layout-sider'
      trigger={null}
      collapsedWidth={64}
      style={{ ...siderStyles, backgroundColor: finalMode === 'dark' ?  'var(--ant-layout-sider-bg)' : colorBgContainer }}
      collapsible
      width={sidebar.width}
      theme={finalMode}
      collapsed={sidebar.collapsed}
    >
      <SystemLogo />
      <MenuComponent />
    </Layout.Sider>
  );
});

LeftMenu.displayName = 'LeftMenu';

export default LeftMenu;
