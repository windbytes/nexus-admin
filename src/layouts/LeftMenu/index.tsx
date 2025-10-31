import type React from 'react';
import { memo, useMemo } from 'react';
import { Layout } from 'antd';
import { useShallow } from 'zustand/shallow';

import './leftMenu.scss';
import { usePreferencesStore } from '@/stores/store';
import SystemLogo from './component/SystemLogo';
import MenuComponent from './component/MenuComponent';

// 提取静态样式对象到组件外部，避免每次渲染都创建新对象
const siderStyles = {
  overflow: 'hidden',
  position: 'relative',
  transition: 'width .2s cubic-bezier(.34,.69,.1,1)',
  zIndex: 999,
  boxShadow: '0 2px 5px #00000014',
  borderRight: '1px solid #ededed',
} as const;

const containerStyles = {
  overflow: 'hidden',
} as const;

/**
 * 左边的菜单栏
 * 性能优化：
 * 1. 使用 useShallow 避免不必要的重渲染
 * 2. 使用 useMemo 缓存派生的 mode 值
 * 3. 提取静态样式对象到组件外部
 * 4. 使用 memo 避免父组件变化时的重渲染
 */
const LeftMenu: React.FC = memo(() => {
  // 使用 shallow 避免不必要的重渲染
  const { sidebar, mode, semiDarkSidebar } = usePreferencesStore(
    useShallow((state) => ({
      sidebar: state.preferences.sidebar,
      mode: state.preferences.theme.mode,
      semiDarkSidebar: state.preferences.theme.semiDarkSidebar,
    })),
  );

  // 使用 useMemo 缓存派生的 mode 值
  const finalMode = useMemo(() => {
    let currentMode = mode;
    if (currentMode === 'auto') {
      // 检查 window 对象是否存在，以兼容 SSR (服务端渲染)
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
      trigger={null}
      collapsedWidth={64}
      style={siderStyles}
      collapsible
      width={sidebar.width}
      theme={finalMode}
      collapsed={sidebar.collapsed}
    >
      <div className="flex flex-col h-full" style={containerStyles}>
        <SystemLogo />
        <MenuComponent />
      </div>
    </Layout.Sider>
  );
});

LeftMenu.displayName = 'LeftMenu';

export default LeftMenu;
