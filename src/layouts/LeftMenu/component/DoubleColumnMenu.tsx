import { useLocation, useNavigate } from '@tanstack/react-router';
import { Menu, type MenuProps, Spin } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { BubbleLoading } from '@/components/icons';
import { useMenuStore, usePreferencesStore } from '@/stores/store';
import { searchRoute } from '@/utils/utils';
import { buildMenuItems, type MenuItem, resolveMenuSelection } from './menu-utils';

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
  const { dynamicTitle, collapsed, locale } = usePreferencesStore(
    useShallow((state) => ({
      dynamicTitle: state.preferences.app.dynamicTitle,
      collapsed: state.preferences.sidebar.collapsed,
      locale: state.preferences.app.locale,
    }))
  );
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

  // 左列：仅一级，不展示子菜单
  const firstLevelItems: MenuItem[] = useMemo(
    () =>
      menuList.map((item: MenuItem) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        type: item.type,
      })),
    [menuList]
  );

  // 右列：当前一级的子项
  const secondLevelItems: MenuItem[] = useMemo(() => {
    if (!selectedFirstKey) {
      return [];
    }
    const first = menuList.find((m) => m?.key === selectedFirstKey);
    const children = (first?.children as MenuItem[] | undefined) ?? [];
    return children;
  }, [menuList, selectedFirstKey]);

  const hasChildren = useCallback(
    (key: string) => {
      const item = menuList.find((m) => m?.key === key);
      return Array.isArray(item?.children) && item.children.length > 0;
    },
    [menuList]
  );

  const onLeftClick: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
      if (hasChildren(key)) {
        setSelectedFirstKey(key);
      } else {
        navigate({ to: key, replace: true });
      }
    },
    [hasChildren, navigate]
  );

  const onRightClick: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
      navigate({ to: key, replace: true });
    },
    [navigate]
  );

  useEffect(() => {
    const route = searchRoute(pathname, menus);
    if (route?.meta?.title && dynamicTitle) {
      document.title = `Nexus - ${t(route.meta.title)}`;
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
        <Spin indicator={<BubbleLoading width={24} />} spinning />
      </div>
    );
  }

  const leftSelectedKeys = selectedFirstKey ? [selectedFirstKey] : [];
  const rightSelectedKeys = selectedPath ? [selectedPath] : [];

  return (
    <div className="nexus-double-column-menu flex flex-1 min-h-0">
      <div className="nexus-double-column-menu-left flex flex-col min-w-0 flex-1">
        <Menu
          className="side-menu border-r border-[#00000012]"
          classNames={{ root: 'border-e-0!' }}
          mode="inline"
          theme={mode}
          inlineCollapsed
          selectedKeys={leftSelectedKeys}
          items={firstLevelItems}
          onClick={onLeftClick}
        />
      </div>
      {!collapsed && secondLevelItems.length > 0 && (
        <div className="nexus-double-column-menu-right flex flex-col min-w-0 flex-1">
          <Menu
            className="side-menu"
            classNames={{ root: 'border-e-0!' }}
            mode="inline"
            theme={mode}
            selectedKeys={rightSelectedKeys}
            items={secondLevelItems}
            onClick={onRightClick}
          />
        </div>
      )}
    </div>
  );
};

DoubleColumnMenu.displayName = 'DoubleColumnMenu';

export default DoubleColumnMenu;
