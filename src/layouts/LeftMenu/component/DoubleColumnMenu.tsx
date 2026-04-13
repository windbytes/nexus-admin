import { LoadingOutlined } from '@ant-design/icons';
import { Layout, Menu, type MenuProps, Spin, theme } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useShallow } from 'zustand/shallow';
import CollapseSwitch from '@/layouts/Header/component/CollapseSwitch';
import { useMenuStore, usePreferencesStore } from '@/stores/store';
import { searchRoute } from '@/utils/utils';
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
  const { dynamicTitle, collapsed, locale, sidebarWidth } = usePreferencesStore(
    useShallow((state) => ({
      dynamicTitle: state.preferences.app.dynamicTitle,
      collapsed: state.preferences.sidebar.collapsed,
      locale: state.preferences.app.locale,
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

  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  /** 当前选中的一级菜单 key（有子菜单时用于展示右侧列） */
  const [selectedFirstKey, setSelectedFirstKey] = useState<string | null>(null);

  // 根据 pathname 解析出一级 key 与当前选中 path
  const { firstLevelKey, selectedPath } = useMemo(() => {
    if (!caches?.pathMap?.size) {
      return { firstLevelKey: null as string | null, selectedPath: null as string | null };
    }
    const { selectedPath: path, openKeys } = resolveMenuSelection(pathname, caches);
    const first = openKeys?.[0] ?? path ?? null;
    return { firstLevelKey: first, selectedPath: path };
  }, [pathname, caches]);

  // 同步路由到“选中的一级”
  useEffect(() => {
    if (firstLevelKey != null) {
      setSelectedFirstKey(firstLevelKey);
    }
  }, [firstLevelKey]);

  // 左列：仅一级，不展示子菜单（剥离 children 避免渲染子菜单）
  const firstLevelItems: MenuItem[] = useMemo(
    () =>
      menuList
        .filter((item): item is NonNullable<MenuItem> => item != null)
        .map((item) => {
          const { children: _, ...rest } = item as unknown as Record<string, unknown>;
          return rest as unknown as MenuItem;
        }),
    [menuList]
  );

  // 右列：当前一级的子项
  const secondLevelItems: MenuItem[] = useMemo(() => {
    if (!selectedFirstKey) {
      return [];
    }
    const first = menuList.find((m) => m != null && 'key' in m && m.key === selectedFirstKey);
    if (first != null && 'children' in first && Array.isArray(first.children)) {
      return first.children as MenuItem[];
    }
    return [];
  }, [menuList, selectedFirstKey]);

  const hasChildren = useCallback(
    (key: string) => {
      const item = menuList.find((m) => m != null && 'key' in m && m.key === key);
      return item != null && 'children' in item && Array.isArray(item.children) && item.children.length > 0;
    },
    [menuList]
  );

  const onLeftClick: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
      if (hasChildren(key)) {
        setSelectedFirstKey(key);
      } else {
        navigate(key, { replace: true });
      }
    },
    [hasChildren, navigate]
  );

  const onRightClick: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
      navigate(key, { replace: true });
    },
    [navigate]
  );

  useEffect(() => {
    const route = searchRoute(pathname, menus);
    if (route?.meta?.title && dynamicTitle) {
      document.title = `Syndra - ${t(route.meta.title)}`;
    }
  }, [pathname, menus, dynamicTitle, t]);

  useEffect(() => {
    if (!menus?.length) {
      setMenuList([]);
      return;
    }
    setLoading(true);
    const tid = setTimeout(() => {
      setMenuList(buildMenuItems(menus, t));
      setLoading(false);
    }, 0);
    return () => clearTimeout(tid);
  }, [menus, locale, t]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spin indicator={<LoadingOutlined width={24} />} spinning />
      </div>
    );
  }

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
