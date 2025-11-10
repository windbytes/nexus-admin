import { useMenuStore, usePreferencesStore } from '@/stores/store';
import type { RouteItem } from '@/types/route';
import { getIcon } from '@/utils/optimized-icons';
import { getOpenKeys, searchRoute } from '@/utils/utils';
import { Icon } from '@iconify-icon/react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Empty, Menu, Spin, type MenuProps } from 'antd';
import type { TFunction } from 'i18next';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

type MenuItem = Required<MenuProps>['items'][number];

const getItem = (
  t: TFunction,
  label: any,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem => {
  return {
    key,
    icon,
    children,
    label: t(label),
    type,
  } as MenuItem;
};

const buildMenuItems = (menuList: RouteItem[], t: TFunction): MenuItem[] => {
  const result: MenuItem[] = [];

  for (const item of menuList) {
    if (item?.meta?.menuType === 2 || item?.meta?.menuType === 3 || item?.hidden) {
      continue;
    }

    if (!item?.children?.length) {
      result.push(getItem(t, item.meta?.title, item.path, getIcon(item.meta?.icon)));
      continue;
    }

    result.push(getItem(t, item.meta?.title, item.path, getIcon(item.meta?.icon), buildMenuItems(item.children, t)));
  }

  return result;
};

const isVisibleMenu = (menu: RouteItem) => {
  return !(menu.hidden || menu.meta?.menuType === 2 || menu.meta?.menuType === 3);
};

const hasRoutePath = (routes: RouteItem[] | undefined, targetPath: string): boolean => {
  if (!routes || routes.length === 0) {
    return false;
  }

  for (const route of routes) {
    if (route.path === targetPath) {
      return true;
    }

    if (hasRoutePath(route.children, targetPath)) {
      return true;
    }

    if (hasRoutePath(route.childrenRoute, targetPath)) {
      return true;
    }
  }

  return false;
};

const findNearestVisibleMenuPath = (menuList: RouteItem[], targetPath: string): string | null => {
  for (const menu of menuList) {
    if (!isVisibleMenu(menu)) {
      continue;
    }

    if (menu.path === targetPath) {
      return menu.path;
    }

    if (menu.children && menu.children.length > 0) {
      const childMatch = findNearestVisibleMenuPath(menu.children, targetPath);
      if (childMatch) {
        return childMatch;
      }
    }

    if (hasRoutePath(menu.childrenRoute, targetPath)) {
      return menu.path;
    }
  }

  return null;
};

/**
 * 菜单组件
 * 性能优化：
 * 1. 使用 React 19 的 useTransition 优化路由切换
 * 2. 添加导航加载状态，提供即时反馈
 * 3. 优化菜单构建性能
 */
const MenuComponent = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const menus = useMenuStore((state) => state.menus);
  const { accordion, dynamicTitle, collapsed, locale } = usePreferencesStore(
    useShallow((state) => ({
      accordion: state.preferences.navigation.accordion,
      dynamicTitle: state.preferences.app.dynamicTitle,
      collapsed: state.preferences.sidebar.collapsed,
      locale: state.preferences.app.locale,
    }))
  );
  const mode = usePreferencesStore((state) => {
    let mode = state.preferences.theme.mode;
    if (mode === 'auto') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (state.preferences.theme.semiDarkSidebar) {
      mode = 'dark';
    }
    return mode;
  });

  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [userInteracted, setUserInteracted] = useState(false); // 标记用户是否手动操作过菜单
  const [selectedKeys, setSelectedKeys] = useState<string[]>([pathname]);
  const [computedOpenKeys, setComputedOpenKeys] = useState<string[]>(() => getOpenKeys(pathname, menus));

  const clickMenu: MenuProps['onClick'] = useCallback(({ key }: { key: string }) => {
    // 点击菜单项导航时，重置用户交互标志，让菜单自动同步
    setUserInteracted(false);
    navigate({ to: key, replace: true });
  }, []);

  const currentSelectedKeys = useMemo(() => selectedKeys, [selectedKeys]);

  const currentOpenKeys = useMemo(() => computedOpenKeys, [computedOpenKeys]);

  // 【优化】使用 useCallback 优化
  const onOpenChange = useCallback(
    (newOpenKeys: string[]) => {
      setUserInteracted(true); // 标记用户已手动操作

      if (!accordion) {
        setOpenKeys(newOpenKeys);
        return;
      }

      // 手风琴模式：只保留最新打开的一级菜单
      if (newOpenKeys.length < 1) {
        setOpenKeys(newOpenKeys);
        return;
      }

      const latestOpenKey = newOpenKeys[newOpenKeys.length - 1];
      if (latestOpenKey && newOpenKeys[0] && latestOpenKey.includes(newOpenKeys[0])) {
        setOpenKeys(newOpenKeys);
        return;
      }

      if (latestOpenKey) {
        setOpenKeys([latestOpenKey]);
      }
    },
    [accordion]
  );

  // 【优化】智能合并用户手动操作和自动同步的 openKeys
  const mergedOpenKeys = useMemo(() => {
    // 如果用户手动操作过，完全使用用户的选择
    if (userInteracted) {
      return openKeys;
    }
    // 否则使用自动计算的 openKeys
    return currentOpenKeys;
  }, [userInteracted, openKeys, currentOpenKeys]);

  // 【优化】合并 pathname 和标题更新逻辑
  useEffect(() => {
    const route = searchRoute(pathname, menus);
    if (route && Object.keys(route).length && dynamicTitle) {
      const title = route.meta?.title;
      if (title) document.title = `Nexus - ${t(title)}`;
    }
  }, [pathname, menus, dynamicTitle, t]);

  useEffect(() => {
    if (!menus || menus.length === 0) {
      return;
    }

    const nearestMenuPath = findNearestVisibleMenuPath(menus, pathname);
    if (!nearestMenuPath) {
      return;
    }

    setSelectedKeys((prev) => {
      if (prev.length === 1 && prev[0] === nearestMenuPath) {
        return prev;
      }
      return [nearestMenuPath];
    });

    const openKey = getOpenKeys(nearestMenuPath, menus);
    setComputedOpenKeys((prev) => {
      if (prev.length === openKey.length && prev.every((key, index) => key === openKey[index])) {
        return prev;
      }
      return openKey;
    });
    setOpenKeys((prev) => {
      if (prev.length === openKey.length && prev.every((key, index) => key === openKey[index])) {
        return prev;
      }
      return openKey;
    });
    setUserInteracted(false);
  }, [pathname, menus]);

  // 【优化】只在菜单数据或语言真正变化时重新生成菜单列表
  useEffect(() => {
    if (!menus || menus.length === 0) {
      setMenuList([]);
      return;
    }

    setLoading(true);
    // 使用 setTimeout 将菜单构建推迟到空闲时
    const timeoutId = setTimeout(() => {
      const menu = buildMenuItems(menus, t);
      setMenuList(menu);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [menus, locale, t]);

  return (
    <Spin
      wrapperClassName="side-menu"
      indicator={<Icon icon="eos-icons:bubble-loading" width={24} />}
      spinning={loading}
      tip={loading ? '加载中...' : '加载菜单'}
    >
      {menuList.length > 0 ? (
        <Menu
          style={{
            borderRight: 0,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0 8px',
          }}
          mode="inline"
          theme={mode}
          inlineCollapsed={collapsed}
          selectedKeys={currentSelectedKeys}
          {...(collapsed ? {} : { openKeys: mergedOpenKeys })}
          items={menuList}
          onClick={clickMenu}
          onOpenChange={onOpenChange}
        />
      ) : (
        <Empty description={<>暂无菜单，请检查用户角色是否具有菜单！</>} />
      )}
    </Spin>
  );
});

MenuComponent.displayName = 'MenuComponent';

export default MenuComponent;
