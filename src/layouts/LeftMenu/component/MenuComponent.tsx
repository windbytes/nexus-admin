import { memo, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Empty, Menu, Spin, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify-icon/react';
import { useMenuStore, usePreferencesStore } from '@/stores/store';
import { getIcon } from '@/utils/optimized-icons';
import { getOpenKeys, searchRoute } from '@/utils/utils';
import type { RouteItem } from '@/types/route';
import { useShallow } from 'zustand/shallow';
import { useTabStore } from '@/stores/tabStore';

type MenuItem = Required<MenuProps>['items'][number];

/**
 * 菜单组件
 * @returns
 */
const MenuComponent = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const menus = useMenuStore((state) => state.menus);
  const { activeKey } = useTabStore();
  const { accordion, dynamicTitle, collapsed } = usePreferencesStore(
    useShallow((state) => ({
      accordion: state.preferences.navigation.accordion,
      dynamicTitle: state.preferences.app.dynamicTitle,
      collapsed: state.preferences.sidebar.collapsed,
    })),
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
  
  // 【优化】缓存上一次的语言，避免不必要的菜单重新生成
  const prevLanguageRef = useRef(i18n.language);

  // 【优化】将 getItem 移到 useMemo 外部，避免重复创建
  const getItem = useCallback(
    (
      label: any,
      key?: React.Key | null,
      icon?: React.ReactNode,
      children?: MenuItem[],
      type?: 'group',
    ): MenuItem => {
      return {
        key,
        icon,
        children,
        label: t(label),
        type,
      } as MenuItem;
    },
    [t]
  );

  // 【优化】使用 useMemo 缓存菜单构建函数，只在 t 变化时重新创建
  const deepLoopFloat = useMemo(
    () => (menuList: RouteItem[], newArr: MenuItem[] = []): MenuItem[] => {
      for (const item of menuList) {
        if (item?.meta?.menuType === 2 || item?.meta?.menuType === 3 || item?.hidden) {
          continue;
        }
        if (!item?.children?.length) {
          newArr.push(getItem(item.meta?.title, item.path, getIcon(item.meta?.icon)));
          continue;
        }
        newArr.push(getItem(item.meta?.title, item.path, getIcon(item.meta?.icon), deepLoopFloat(item.children)));
      }
      return newArr;
    },
    [getItem]
  );

  // 【优化】使用 useCallback 避免每次渲染都创建新函数
  const clickMenu: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
      // 使用 replace 模式，替换当前历史记录，防止用户通过浏览器后退按钮回到之前的菜单
      navigate(key, { replace: true });
    },
    [navigate]
  );

  // 【优化】监听tab切换，同步更新左侧菜单选中状态
  const currentSelectedKeys = useMemo(() => {
    // 如果activeKey与当前pathname不同，说明是通过tab切换触发的
    // 此时使用activeKey作为选中项
    if (activeKey && activeKey !== pathname) {
      return [activeKey];
    }
    // 否则使用当前pathname，避免不必要的状态更新
    return [pathname];
  }, [activeKey, pathname]);

  // 【优化】使用useMemo优化openKeys的计算
  const currentOpenKeys = useMemo(() => {
    const targetPath = activeKey && activeKey !== pathname ? activeKey : pathname;
    return getOpenKeys(targetPath, menus);
  }, [activeKey, pathname, menus]);

  // 【优化】使用 useCallback 优化
  const onOpenChange = useCallback(
    (openKeys: string[]) => {
      if (!accordion) return setOpenKeys(openKeys);
      if (openKeys.length < 1) return setOpenKeys(openKeys);
      const latestOpenKey = openKeys[openKeys.length - 1];
      if (latestOpenKey && openKeys[0] && latestOpenKey.includes(openKeys[0])) return setOpenKeys(openKeys);
      if (latestOpenKey) setOpenKeys([latestOpenKey]);
    },
    [accordion]
  );

  // 【优化】智能合并用户手动操作和自动同步的openKeys
  const mergedOpenKeys = useMemo(() => {
    // 如果用户手动操作过菜单，优先使用用户的操作
    if (openKeys.length > 0) {
      return openKeys;
    }
    // 否则使用自动计算的openKeys
    return currentOpenKeys;
  }, [openKeys, currentOpenKeys]);

  // 【优化】合并 pathname 和标题更新逻辑
  useEffect(() => {
    const route = searchRoute(pathname, menus);
    if (route && Object.keys(route).length) {
      // 更新标题
      if (dynamicTitle) {
        const title = route.meta?.title;
        if (title) document.title = `Nexus - ${t(title)}`;
      }
      // 非折叠状态下，设置打开的 key
      if (!collapsed) {
        const openKey = getOpenKeys(pathname, menus);
        setOpenKeys(openKey);
      }
    }
  }, [pathname, collapsed, menus, dynamicTitle, t]);

  // 【优化】只在菜单数据或语言真正变化时重新生成菜单列表
  useEffect(() => {
    if (!menus || menus.length === 0) {
      setMenuList([]);
      return;
    }

    // 检查语言是否真的变化了
    const languageChanged = prevLanguageRef.current !== i18n.language;
    if (languageChanged) {
      prevLanguageRef.current = i18n.language;
    }

    setLoading(true);
    // 使用 requestIdleCallback 或 setTimeout 将菜单构建推迟到空闲时
    const timeoutId = setTimeout(() => {
      const menu = deepLoopFloat(menus, []);
      setMenuList(menu);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [menus, i18n.language, deepLoopFloat]);

  return (
    <Spin
      wrapperClassName="side-menu"
      indicator={<Icon icon="eos-icons:bubble-loading" width={24} />}
      spinning={loading}
      tip="加载中"
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
};

export default memo(MenuComponent);
