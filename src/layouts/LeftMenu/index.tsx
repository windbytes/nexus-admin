import { Layout, theme } from 'antd';
import type React from 'react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { usePreferencesStore } from '@/stores/store';
import type { LayoutType } from '@/types/app';
import DoubleColumnMenu from './component/DoubleColumnMenu';
import MenuComponent from './component/MenuComponent';
import SystemLogo from './component/SystemLogo';
import './leftMenu.scss';

/** 使用双列菜单的布局类型（左列一级、右列子菜单） */
const DOUBLE_COLUMN_LAYOUTS: LayoutType[] = ['sidebar-mixed-nav', 'header-mixed-nav'];

const LeftMenu: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { sidebar, mode, semiDarkSidebar, layout } = usePreferencesStore(
    useShallow((state) => ({
      sidebar: state.preferences.sidebar,
      mode: state.preferences.theme.mode,
      semiDarkSidebar: state.preferences.theme.semiDarkSidebar,
      layout: state.preferences.app.layout,
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

  const isDoubleColumn = DOUBLE_COLUMN_LAYOUTS.includes(layout);

  return (
    <Layout.Sider
      className={`nexus-layout-sider shrink-0 ${isDoubleColumn ? 'nexus-layout-sider-double' : ''}`}
      trigger={null}
      collapsedWidth={64}
      style={{ backgroundColor: finalMode === 'dark' ? 'var(--ant-layout-sider-bg)' : colorBgContainer }}
      collapsible
      width={sidebar.width}
      theme={finalMode}
      collapsed={sidebar.collapsed}
    >
      <SystemLogo />
      {isDoubleColumn ? <DoubleColumnMenu /> : <MenuComponent />}
    </Layout.Sider>
  );
};

LeftMenu.displayName = 'LeftMenu';

export default LeftMenu;
