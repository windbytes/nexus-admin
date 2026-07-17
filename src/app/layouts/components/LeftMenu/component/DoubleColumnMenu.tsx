import { Layout, Menu, type MenuProps, theme } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useShallow } from 'zustand/shallow';
import CollapseSwitch from '@/app/layouts/components/Header/component/CollapseSwitch';
import { useMenuStore, usePreferencesStore } from '@/shared/stores/preferences.store';
import { searchRoute } from '@/shared/utils/utils';
import { buildMenuItems, type MenuItem, resolveMenuSelection } from './menu-utils';
import SystemLogo from './SystemLogo';

/**
 * 双列菜单：左列一级菜单，右列当前一级的子菜单
 */
const DoubleColumnMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { menus, caches } = useMenuStore(
    useShallow((state) => ({
      menus: state.menus,
      caches: state.caches,
    }))
  );
  const { dynamicTitle, collapsed, sidebarWidth } = usePreferencesStore(
    useShallow((state) => ({
      dynamicTitle: state.preferences.app.dynamicTitle,
      collapsed: state.preferences.sidebar.collapsed,
      sidebarWidth: state.preferences.sidebar.width,
    }))
  );
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const mode = usePreferencesStore((state) => {
    let m = state.preferences.theme.mode;
    if (m === 'auto') {
      m = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (state.preferences.theme.semiDarkSidebar) {
      m = 'dark';
    }
    return m;
  });

  const [menuOverride, setMenuOverride] = useState<{ pathname: string; key: string } | null>(null);

  const { firstLevelKey, selectedPath } = (() => {
    if (!caches?.pathMap?.size) {
      return { firstLevelKey: null as string | null, selectedPath: null as string | null };
    }
    const { selectedPath: path, openKeys } = resolveMenuSelection(pathname, caches);
    const first = openKeys?.[0] ?? path ?? null;
    return { firstLevelKey: first, selectedPath: path };
  })();

  const selectedFirstKey =
    menuOverride?.pathname === pathname ? menuOverride.key : firstLevelKey;
  const menuList = menus?.length ? buildMenuItems(menus, t) : [];

  // 左列：仅一级，不展示子菜单（剥离 children 避免渲染子菜单）
  const firstLevelItems: MenuItem[] = menuList
    .filter((item): item is NonNullable<MenuItem> => item != null)
    .map((item) => {
      const { children: _, ...rest } = item as unknown as Record<string, unknown>;
      return rest as unknown as MenuItem;
    });

  const secondLevelItems: MenuItem[] = (() => {
    if (!selectedFirstKey) {
      return [];
    }
    const first = menuList.find((m) => m != null && 'key' in m && m.key === selectedFirstKey);
    if (first != null && 'children' in first && Array.isArray(first.children)) {
      return first.children as MenuItem[];
    }
    return [];
  })();

  const hasChildren = (key: string) => {
    const item = menuList.find((m) => m != null && 'key' in m && m.key === key);
    return item != null && 'children' in item && Array.isArray(item.children) && item.children.length > 0;
  };

  const onLeftClick: MenuProps['onClick'] = ({ key }: { key: string }) => {
    if (hasChildren(key)) {
      setMenuOverride({ pathname, key });
    } else {
      setMenuOverride(null);
      navigate({ to: key, replace: true });
    }
  };

  const onRightClick: MenuProps['onClick'] = ({ key }: { key: string }) => {
    navigate({ to: key, replace: true });
  };

  useEffect(() => {
    const route = searchRoute(pathname, menus);
    if (route?.meta?.title && dynamicTitle) {
      document.title = `Syndra - ${t(route.meta.title)}`;
    }
  }, [pathname, menus, dynamicTitle, t]);

  const leftSelectedKeys = selectedFirstKey ? [selectedFirstKey] : [];
  const rightSelectedKeys = selectedPath ? [selectedPath] : [];

  return (
    <div className="syndra-double-column-menu flex flex-1 min-h-0">
      <div className="syndra-double-column-menu-left flex flex-col min-w-0 flex-1">
        <SystemLogo variant="iconOnly" />
        <Menu
          className="side-menu border-r border-[#00000012] flex-1 min-h-0"
          classNames={{ root: 'border-e-0!' }}
          mode="inline"
          theme={mode}
          inlineCollapsed
          selectedKeys={leftSelectedKeys}
          items={firstLevelItems}
          onClick={onLeftClick}
        />
      </div>

      <Layout.Sider
        className="syndra-double-column-menu-right shrink-0"
        collapsedWidth={collapsed ? 56 : sidebarWidth}
        width={sidebarWidth}
        theme={mode}
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          backgroundColor: mode === 'dark' ? 'var(--ant-layout-sider-bg)' : colorBgContainer,
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        <div className="flex flex-col h-full min-h-0">
          {!collapsed && <SystemLogo variant="nameOnly" />}
          <Menu
            className="side-menu flex-1 min-h-0"
            classNames={{ root: 'border-e-0!' }}
            mode="inline"
            theme={mode}
            inlineCollapsed={collapsed}
            selectedKeys={rightSelectedKeys}
            items={secondLevelItems}
            onClick={onRightClick}
          />
          <div className="syndra-double-column-menu-footer shrink-0 flex items-center justify-center border-t border-[#00000012] py-2">
            <CollapseSwitch />
          </div>
        </div>
      </Layout.Sider>
    </div>
  );
};

DoubleColumnMenu.displayName = 'DoubleColumnMenu';

export default DoubleColumnMenu;
