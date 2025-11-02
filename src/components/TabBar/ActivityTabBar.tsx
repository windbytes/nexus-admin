import { useMenuStore } from '@/stores/store';
import { useTabStore, type TabItem } from '@/stores/tabStore';
import { useUserStore } from '@/stores/userStore';
import type { RouteItem } from '@/types/route';
import { getIcon } from '@/utils/optimized-icons';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Tabs, type MenuProps, type TabsProps } from 'antd';
import { memo, startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useShallow } from 'zustand/shallow';
import './tabBar.scss';

interface ActivityTabBarProps {
  className?: string;
}

/**
 * 使用 React 19.2 优化的 TabBar 组件
 *
 * 核心优化：
 * 1. 拆分复杂的 useEffect，提升可读性和性能
 * 2. 减少 startTransition 的使用，只在真正需要时使用
 * 3. 优化菜单配置函数，减少重新创建
 * 4. 使用 useRef 缓存稳定的引用，减少依赖
 * 5. 简化路由缓存逻辑
 */
const ActivityTabBar: React.FC<ActivityTabBarProps> = memo(({ className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // 右键菜单状态
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuTabKey, setContextMenuTabKey] = useState('');

  // 使用 useShallow 优化状态选择
  const {
    tabs,
    activeKey,
    setActiveKey,
    removeTab,
    closeOtherTabs,
    closeLeftTabs,
    closeRightTabs,
    closeAllTabs,
    reloadTab,
    pinTab,
    unpinTab,
    resetTabs,
    addTab,
    setTabs,
  } = useTabStore(
    useShallow((state) => ({
      tabs: state.tabs,
      activeKey: state.activeKey,
      setActiveKey: state.setActiveKey,
      removeTab: state.removeTab,
      closeOtherTabs: state.closeOtherTabs,
      closeLeftTabs: state.closeLeftTabs,
      closeRightTabs: state.closeRightTabs,
      closeAllTabs: state.closeAllTabs,
      reloadTab: state.reloadTab,
      pinTab: state.pinTab,
      unpinTab: state.unpinTab,
      resetTabs: state.resetTabs,
      addTab: state.addTab,
      setTabs: state.setTabs,
    }))
  );

  const menus = useMenuStore((state) => state.menus);
  const homePath = useUserStore((state) => state.homePath);

  // 使用 Map 缓存路由查找结果
  const routeCacheRef = useRef(new Map<string, RouteItem | undefined>());

  // 路由查找函数 - 使用稳定的引用
  const findRouteByPathRef = useRef((path: string): RouteItem | undefined => {
    // 先从缓存查找
    if (routeCacheRef.current.has(path)) {
      return routeCacheRef.current.get(path);
    }

    // 递归搜索
    const searchRoute = (routes: RouteItem[], targetPath: string): RouteItem | undefined => {
      for (const route of routes) {
        if (route.path === targetPath) return route;
        if (route.children) {
          const found = searchRoute(route.children, targetPath);
          if (found) return found;
        }
      }
      return undefined;
    };

    const result = searchRoute(menus, path);
    routeCacheRef.current.set(path, result);
    return result;
  });

  // 菜单变化时清空缓存
  const prevMenusLengthRef = useRef(menus.length);
  if (prevMenusLengthRef.current !== menus.length) {
    routeCacheRef.current.clear();
    prevMenusLengthRef.current = menus.length;
  }

  // 创建 tab 的辅助函数
  const createTabItem = useCallback(
    (path: string, route: RouteItem, closable: boolean): TabItem => ({
      key: path,
      label: route.meta?.title || path,
      ...(route.meta?.icon && { icon: route.meta.icon }),
      path,
      closable,
      route,
    }),
    []
  );

  // 初始化标记
  const isInitializedRef = useRef(false);

  // 【优化1】初始化逻辑 - 只在首次运行
  useEffect(() => {
    if (isInitializedRef.current || !menus.length || !homePath || pathname === '/login') return;

    isInitializedRef.current = true;
    const findRouteByPath = findRouteByPathRef.current;

    // 使用 startTransition 包裹初始化逻辑
    startTransition(() => {
      if (tabs.length === 0) {
        // 初始化：创建首页 tab
        const homeRoute = findRouteByPath(homePath);
        if (homeRoute?.path) {
          const homeTab = createTabItem(homePath, homeRoute, false);
          addTab(homeTab, { insertAt: 'head', activate: false });

          // 如果当前路径不是首页，创建对应 tab
          if (pathname !== homePath) {
            const currentRoute = findRouteByPath(pathname);
            if (currentRoute?.path) {
              const currentTab = createTabItem(pathname, currentRoute, true);
              addTab(currentTab, { insertAt: 'tail', activate: true });
            } else {
              navigate({ to: homePath, replace: true });
            }
          } else {
            setActiveKey(homePath);
          }
        }
      } else {
        // 已有 tabs，确保首页 tab 在第一位
        const homeRoute = findRouteByPath(homePath);
        if (homeRoute?.path) {
          const homeTabIndex = tabs.findIndex((tab) => tab.key === homePath);

          if (homeTabIndex === -1) {
            const homeTab = createTabItem(homePath, homeRoute, false);
            addTab(homeTab, { insertAt: 'head', activate: false });
          } else if (homeTabIndex > 0) {
            const homeTab = tabs[homeTabIndex];
            if (homeTab) {
              const otherTabs = tabs.filter((tab) => tab.key !== homePath);
              setTabs([homeTab, ...otherTabs], activeKey);
            }
          }
        }

        // 激活当前路径
        const currentTab = tabs.find((tab) => tab.key === pathname);
        if (currentTab) {
          setActiveKey(pathname);
        } else if (pathname !== homePath) {
          const currentRoute = findRouteByPath(pathname);
          if (currentRoute?.path) {
            const currentTab = createTabItem(pathname, currentRoute, true);
            addTab(currentTab, { insertAt: 'tail', activate: true });
          }
        }
      }
    });
  }, [menus.length, homePath, pathname]); // 最小化依赖

  // 【优化2】路径变化处理 - 独立的 effect
  useEffect(() => {
    if (!isInitializedRef.current || !menus.length || !homePath || pathname === '/login') return;

    const currentTab = tabs.find((tab) => tab.key === pathname);

    if (currentTab) {
      // tab 存在，只需激活
      if (activeKey !== pathname) {
        setActiveKey(pathname);
      }
    } else {
      // tab 不存在，创建新 tab
      const findRouteByPath = findRouteByPathRef.current;
      const currentRoute = findRouteByPath(pathname);

      if (currentRoute?.path) {
        const currentTab = createTabItem(pathname, currentRoute, true);
        startTransition(() => {
          addTab(currentTab, { insertAt: 'tail', activate: true });
        });
      }
    }

    // tabs 为空时跳转首页
    if (tabs.length === 0 && pathname !== homePath) {
      navigate({ to: homePath, replace: true });
    }
  }, [pathname, tabs.length, activeKey]); // 最小化依赖

  // 【优化3】监听用户退出登录 - 独立的 effect
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user-storage') {
        try {
          const userData = JSON.parse(e.newValue || '{}');
          if (!userData.isLogin) {
            resetTabs();
            isInitializedRef.current = false;
          }
        } catch {
          // 忽略解析错误
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [resetTabs]);

  // 处理右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent, tabKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuTabKey(tabKey);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenuVisible(false);
  }, []);

  // 处理 tab 点击切换
  const handleTabClick = useCallback(
    (key: string, e?: React.MouseEvent | React.KeyboardEvent) => {
      // 检查事件是否来自 Dropdown 菜单
      if (e?.target) {
        const target = e.target as HTMLElement;
        if (target.closest('.ant-dropdown-menu') || target.closest('[role="menuitem"]')) {
          return;
        }
      }

      // 只在路径不同时才导航
      if (key !== pathname) {
        navigate({ to: key, replace: true });
      }
    },
    [navigate, pathname]
  );

  // 处理 tab 关闭
  const handleTabEdit = useCallback(
    (e: React.Key | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove') => {
      if (action === 'remove' && typeof e === 'string') {
        const newActiveKey = removeTab(e);
        // 如果关闭的是当前激活的 tab，跳转到新的激活 tab
        if (e === activeKey && newActiveKey && newActiveKey !== pathname) {
          navigate({ to: newActiveKey, replace: true });
        }
      }
    },
    [removeTab, activeKey, pathname, navigate]
  );

  // 【优化4】统一的菜单配置 - 使用 useCallback + 稳定的 actions ref
  const actionsRef = useRef({
    closeTab: (tabKey: string) => {
      const newActiveKey = removeTab(tabKey);
      if (tabKey === activeKey && newActiveKey && newActiveKey !== pathname) {
        navigate({ to: newActiveKey, replace: true });
      }
    },
    togglePin: (tabKey: string, isClosable: boolean) => {
      isClosable ? pinTab(tabKey) : unpinTab(tabKey);
    },
    reloadTab: (tabKey: string) => reloadTab(tabKey),
    openInNew: (path: string) => window.open(path, '_blank'),
    closeLeftTabs: (tabKey: string) => {
      const newActiveKey = closeLeftTabs(tabKey, homePath);
      if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
        navigate({ to: newActiveKey, replace: true });
      }
    },
    closeRightTabs: (tabKey: string) => {
      const newActiveKey = closeRightTabs(tabKey, homePath);
      if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
        navigate({ to: newActiveKey, replace: true });
      }
    },
    closeOtherTabs: (tabKey: string) => {
      const newActiveKey = closeOtherTabs(tabKey, homePath);
      if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
        navigate({ to: newActiveKey, replace: true });
      }
    },
    closeAllTabs: () => {
      const newActiveKey = closeAllTabs(homePath);
      if (newActiveKey && newActiveKey !== pathname) {
        navigate({ to: newActiveKey, replace: true });
      } else if (!newActiveKey && homePath) {
        navigate({ to: homePath, replace: true });
      }
    },
  });

  // 更新 actions ref
  actionsRef.current = {
    closeTab: (tabKey: string) => {
      const newActiveKey = removeTab(tabKey);
      if (tabKey === activeKey && newActiveKey && newActiveKey !== pathname) {
        navigate({ to: newActiveKey, replace: true });
      }
    },
    togglePin: (tabKey: string, isClosable: boolean) => {
      isClosable ? pinTab(tabKey) : unpinTab(tabKey);
    },
    reloadTab: (tabKey: string) => reloadTab(tabKey),
    openInNew: (path: string) => window.open(path, '_blank'),
    closeLeftTabs: (tabKey: string) => {
      const newActiveKey = closeLeftTabs(tabKey, homePath);
      if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
        navigate({ to: newActiveKey, replace: true });
      }
    },
    closeRightTabs: (tabKey: string) => {
      const newActiveKey = closeRightTabs(tabKey, homePath);
      if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
        navigate({ to: newActiveKey, replace: true });
      }
    },
    closeOtherTabs: (tabKey: string) => {
      const newActiveKey = closeOtherTabs(tabKey, homePath);
      if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
        navigate({ to: newActiveKey, replace: true });
      }
    },
    closeAllTabs: () => {
      const newActiveKey = closeAllTabs(homePath);
      if (newActiveKey && newActiveKey !== pathname) {
        navigate({ to: newActiveKey, replace: true });
      } else if (!newActiveKey && homePath) {
        navigate({ to: homePath, replace: true });
      }
    },
  };

  const getMenuItems = useCallback(
    (targetTabKey?: string): MenuProps['items'] => {
      const tabKey = targetTabKey || activeKey;
      const targetTab = tabs.find((tab) => tab.key === tabKey);
      if (!tabKey || !targetTab) return [];

      const actions = actionsRef.current;

      return [
        {
          key: 'close',
          label: t('common.close'),
          icon: <span>✕</span>,
          onClick: () => actions.closeTab(tabKey),
        },
        {
          key: 'pin',
          label: targetTab.closable ? t('common.pin') : t('common.unpin'),
          icon: <span>📌</span>,
          onClick: () => actions.togglePin(tabKey, targetTab.closable),
        },
        {
          key: 'reload',
          label: t('common.reload'),
          icon: <span>🔄</span>,
          onClick: () => actions.reloadTab(tabKey),
        },
        {
          key: 'openInNewWindow',
          label: t('common.openInNewWindow'),
          icon: <span>⧉</span>,
          onClick: () => actions.openInNew(targetTab.path),
        },
        { type: 'divider' },
        {
          key: 'closeLeft',
          label: t('common.closeLeftTabs'),
          icon: <span>◀</span>,
          onClick: () => actions.closeLeftTabs(tabKey),
        },
        {
          key: 'closeRight',
          label: t('common.closeRightTabs'),
          icon: <span>▶</span>,
          onClick: () => actions.closeRightTabs(tabKey),
        },
        {
          key: 'closeOthers',
          label: t('common.closeOtherTabs'),
          icon: <span>❌</span>,
          onClick: () => actions.closeOtherTabs(tabKey),
        },
        {
          key: 'closeAll',
          label: t('common.closeAllTabs'),
          icon: <span>❌</span>,
          onClick: () => actions.closeAllTabs(),
        },
      ];
    },
    [activeKey, tabs, t]
  );

  // 构建 tab items - 使用 useMemo 缓存
  const tabItems = useMemo((): TabsProps['items'] => {
    return tabs.map((tab) => ({
      key: tab.key,
      label: (
        <div className="flex items-center gap-1 tab-label" onContextMenu={(e) => handleContextMenu(e, tab.key)}>
          {tab.icon && <span className="mr-0.5">{getIcon(tab.icon)}</span>}
          <span>{t(tab.label)}</span>
        </div>
      ),
      closable: tab.closable && tabs.length > 1,
      children: null,
    }));
  }, [tabs, t, handleContextMenu]);

  // 如果没有 tabs，不渲染组件
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={`tab-bar ${className || ''}`}>
      <div className="tab-bar-content">
        <Tabs
          type="editable-card"
          tabBarGutter={0}
          activeKey={activeKey}
          onTabClick={handleTabClick}
          onEdit={handleTabEdit}
          items={tabItems || []}
          size="middle"
          hideAdd
          className="tab-bar-tabs"
          style={{ margin: 0, width: 'calc(100% - 43px)' }}
        />

        {/* 右侧功能区域 */}
        <div className="tab-bar-actions">
          <Dropdown menu={{ items: getMenuItems() || [] }} placement="bottomRight" trigger={['click']}>
            <Button type="text" size="small" icon={<DownOutlined />} className="tab-action-btn" />
          </Dropdown>
        </div>
      </div>

      {/* 统一的右键菜单 */}
      <Dropdown
        menu={{ items: getMenuItems(contextMenuTabKey) || [] }}
        open={contextMenuVisible}
        onOpenChange={(open) => !open && handleContextMenuClose()}
        placement="bottomLeft"
        trigger={['contextMenu']}
        getPopupContainer={() => document.body}
        overlayStyle={{
          position: 'fixed',
          left: contextMenuPosition.x,
          top: contextMenuPosition.y,
        }}
      >
        <div style={{ display: 'none' }} />
      </Dropdown>
    </div>
  );
});

ActivityTabBar.displayName = 'ActivityTabBar';

export default ActivityTabBar;
