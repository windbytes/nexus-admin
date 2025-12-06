import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Menu, type MenuProps, Spin } from 'antd';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { useMenuStore, usePreferencesStore } from '@/stores/store';
import type { MenuCaches } from '@/utils/utils';
import { searchRoute } from '@/utils/utils';

import {
  buildMenuItems,
  createInitialMenuState,
  type MenuItem,
  menuStateReducer,
  resolveMenuSelection,
} from './menu-utils';

/**
 * 菜单组件
 */
const MenuComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { menus, caches } = useMenuStore(
    useShallow((state) => ({
      menus: state.menus,
      caches: state.caches,
    }))
  );
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

  // 菜单列表
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  // 菜单加载状态
  const [loading, setLoading] = useState(false);
  // 菜单状态
  const [menuState, dispatchMenuState] = useReducer(
    menuStateReducer,
    { pathname, caches },
    (initial: { pathname: string; caches: MenuCaches }) => createInitialMenuState(initial.pathname, initial.caches)
  );
  const { selectedKeys, computedOpenKeys, openKeys, userInteracted } = menuState;

  // 菜单点击
  const clickMenu: MenuProps['onClick'] = useCallback(({ key }: { key: string }) => {
    navigate({ to: key, replace: true });
  }, []);

  // 菜单展开状态改变
  const onOpenChange = (newOpenKeys: string[]) => {
    // 侧边栏折叠状态下，不响应 openKeys 的变化
    if (collapsed) {
      return;
    }
    let nextOpenKeys = newOpenKeys;

    if (accordion) {
      if (newOpenKeys.length < 1) {
        nextOpenKeys = newOpenKeys;
      } else {
        const latestOpenKey = newOpenKeys[newOpenKeys.length - 1];
        if (latestOpenKey && newOpenKeys[0] && latestOpenKey.includes(newOpenKeys[0])) {
          nextOpenKeys = newOpenKeys;
        } else if (latestOpenKey) {
          nextOpenKeys = [latestOpenKey];
        }
      }
    }

    dispatchMenuState({ type: 'user-open-change', openKeys: nextOpenKeys });
  };

  const mergedOpenKeys = userInteracted ? openKeys : computedOpenKeys;

  // title 动态设置
  useEffect(() => {
    const route = searchRoute(pathname, menus);
    if (route && Object.keys(route).length && dynamicTitle) {
      const title = route.meta?.title;
      if (title) {
        document.title = `Nexus - ${t(title)}`;
      }
    }
  }, [pathname, menus, dynamicTitle]);

  // 菜单状态同步
  useEffect(() => {
    if (!menus || menus.length === 0 || !caches?.pathMap?.size) {
      return;
    }

    const { selectedPath, openKeys } = resolveMenuSelection(pathname, caches);
    if (!selectedPath) {
      return;
    }

    dispatchMenuState({
      type: 'sync',
      selectedKeys: [selectedPath],
      computedOpenKeys: openKeys,
    });
  }, [pathname, menus, caches]);

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
    <>
      {loading ? (
        <Spin indicator={<Icon icon="eos-icons:bubble-loading" width={24} />} spinning />
      ) : (
        <Menu
          className="side-menu"
          mode="inline"
          theme={mode}
          inlineCollapsed={collapsed}
          selectedKeys={selectedKeys}
          {...(collapsed ? {} : { openKeys: mergedOpenKeys })}
          items={menuList}
          onClick={clickMenu}
          onOpenChange={onOpenChange}
        />
      )}
    </>
  );
};

MenuComponent.displayName = 'MenuComponent';

export default MenuComponent;
