import { Layout, theme } from 'antd';
import type React from 'react';
import { useShallow } from 'zustand/shallow';
import { usePreferencesStore } from '@/shared/stores/preferences.store';
import type { LayoutType } from '@/types/app';
import DoubleColumnMenu from './component/DoubleColumnMenu';
import MenuComponent from './component/MenuComponent';
import SystemLogo from './component/SystemLogo';
import './leftMenu.css';

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

  let finalMode = mode;
  if (finalMode === 'auto') {
    const isDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    finalMode = isDarkMode ? 'dark' : 'light';
  }
  if (semiDarkSidebar) {
    finalMode = 'dark';
  }

  const isDoubleColumn = DOUBLE_COLUMN_LAYOUTS.includes(layout);
  /** 双列时：仅第一列固定 56px，不受 sidebar.width 影响；展开时宽度为 56 + sidebar.width */
  const siderWidth = isDoubleColumn ? (sidebar.collapsed ? 112 : 56 + sidebar.width) : sidebar.width;
  /** 双列时由 width 控制显隐，不用 antd collapsed，故始终 false */
  const siderCollapsed = isDoubleColumn ? false : sidebar.collapsed;

  return (
    <Layout.Sider
      className={`syndra-layout-sider shrink-0 ${isDoubleColumn ? 'syndra-layout-sider-double' : ''}`}
      trigger={null}
      collapsedWidth={isDoubleColumn ? 56 : 64}
      style={{ backgroundColor: finalMode === 'dark' ? 'var(--ant-layout-sider-bg)' : colorBgContainer }}
      collapsible
      width={siderWidth}
      theme={finalMode}
      collapsed={siderCollapsed}
    >
      {isDoubleColumn ? (
        <DoubleColumnMenu />
      ) : (
        <>
          <SystemLogo />
          <MenuComponent />
        </>
      )}
    </Layout.Sider>
  );
};

export default LeftMenu;
