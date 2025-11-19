import { useMenuStore, usePreferencesStore } from '@/stores/store';
import type { MenuCaches } from '@/utils/utils';
import { searchRoute } from '@/utils/utils';
import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Empty, Menu, Spin, type MenuProps } from 'antd';
import { memo, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import {
  buildMenuItems,
  createInitialMenuState,
  menuStateReducer,
  resolveMenuSelection,
  type MenuItem,
} from './menu-utils';

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

  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuState, dispatchMenuState] = useReducer(
    menuStateReducer,
    { pathname, caches },
    (initial: { pathname: string; caches: MenuCaches }) => createInitialMenuState(initial.pathname, initial.caches)
  );
  const { selectedKeys, computedOpenKeys, openKeys, userInteracted } = menuState;

  const clickMenu: MenuProps['onClick'] = useCallback(({ key }: { key: string }) => {
    // 点击菜单项导航时，重置用户交互标志，让菜单自动同步
    dispatchMenuState({ type: 'reset-interaction' });
    navigate({ to: key, replace: true });
  }, []);

  const currentSelectedKeys = useMemo(() => selectedKeys, [selectedKeys]);

  const currentOpenKeys = useMemo(() => computedOpenKeys, [computedOpenKeys]);

  // 【优化】使用 useCallback 优化
  const onOpenChange = useCallback(
    (newOpenKeys: string[]) => {
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
