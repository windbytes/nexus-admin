import { useMenuStore } from '@/stores/store';
import { useTabStore, type TabItem } from '@/stores/tabStore';
import { useUserStore } from '@/stores/userStore';
import type { RouteItem } from '@/types/route';
import { getIcon } from '@/utils/optimized-icons';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Tabs, type MenuProps, type TabsProps } from 'antd';
import React, { startTransition, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useShallow } from 'zustand/shallow';
import './tabBar.scss';

interface ActivityTabBarProps {
  className?: string;
}

/**
 * 使用 React 19.2 Activity 组件实现的 TabBar 组件
 */
const ActivityTabBar: React.FC<ActivityTabBarProps> = ({ className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 用于右键菜单的状态管理
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextMenuTabKey, setContextMenuTabKey] = useState<string>('');

  // 使用 useShallow 优化状态选择，减少不必要的重渲染
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

  const { menus } = useMenuStore(useShallow((state) => ({ menus: state.menus })));
  const { homePath } = useUserStore(useShallow((state) => ({ homePath: state.homePath })));

  // 使用 Map 缓存路由查找结果，避免重复递归搜索
  const routeCacheRef = useRef(new Map<string, RouteItem | undefined>());

  // 清空缓存的 ref
  const lastMenusLengthRef = useRef(menus.length);

  // 检查菜单是否变化，如果变化则清空缓存
  if (lastMenusLengthRef.current !== menus.length) {
    routeCacheRef.current.clear();
    lastMenusLengthRef.current = menus.length;
  }

  // 路由查找函数 - 使用缓存 + 闭包避免依赖 menues
  const findRouteByPath = useCallback(
    (path: string): RouteItem | undefined => {
      // 先从缓存查找
      if (routeCacheRef.current.has(path)) {
        return routeCacheRef.current.get(path);
      }

      // 递归搜索
      const searchRoute = (routes: RouteItem[], targetPath: string): RouteItem | undefined => {
        for (const route of routes) {
          if (route.path === targetPath) {
            return route;
          }
          if (route.children) {
            const found = searchRoute(route.children, targetPath);
            if (found) return found;
          }
        }
        return undefined;
      };

      const result = searchRoute(menus, path);
      // 缓存结果
      routeCacheRef.current.set(path, result);
      return result;
    },
    [menus]
  );

  // 初始化标记
  const isInitializedRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  // 将逻辑拆分为初始化和路径变化两部分，减少重复计算
  React.useEffect(() => {
    // 基础检查
    if (!menus.length || !homePath || pathname === '/login') return;

    // 首次初始化
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;

      // 如果 tabs 为空，创建初始 tab
      if (tabs.length === 0) {
        startTransition(() => {
          const homeRoute = findRouteByPath(homePath);
          if (homeRoute?.path) {
            const homeTabItem: TabItem = {
              key: homePath,
              label: homeRoute.meta?.title || homePath,
              ...(homeRoute.meta?.icon && { icon: homeRoute.meta.icon }),
              path: homePath,
              closable: false,
              route: homeRoute,
            };
            addTab(homeTabItem, { insertAt: 'head', activate: false });
          }

          // 如果当前路径不是 homePath，创建对应 tab
          if (pathname !== homePath) {
            const currentRoute = findRouteByPath(pathname);
            if (currentRoute?.path) {
              const currentTabItem: TabItem = {
                key: pathname,
                label: currentRoute.meta?.title || pathname,
                ...(currentRoute.meta?.icon && { icon: currentRoute.meta.icon }),
                path: pathname,
                closable: true,
                route: currentRoute,
              };
              addTab(currentTabItem, { insertAt: 'tail', activate: true });
            } else {
              navigate(homePath, { replace: true });
            }
          } else if (homeRoute?.path) {
            setActiveKey(homePath);
          }
        });
      } else {
        // 已有 tabs，确保状态正确
        startTransition(() => {
          const homeRoute = findRouteByPath(homePath);
          if (homeRoute?.path) {
            const homeTabIndex = tabs.findIndex((tab) => tab.key === homePath);

            if (homeTabIndex === -1) {
              // homePath tab 不存在，添加
              const homeTabItem: TabItem = {
                key: homePath,
                label: homeRoute.meta?.title || homePath,
                ...(homeRoute.meta?.icon && { icon: homeRoute.meta.icon }),
                path: homePath,
                closable: false,
                route: homeRoute,
              };
              addTab(homeTabItem, { insertAt: 'head', activate: false });
            } else if (homeTabIndex > 0) {
              // 重新排序
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
              const currentTabItem: TabItem = {
                key: pathname,
                label: currentRoute.meta?.title || pathname,
                ...(currentRoute.meta?.icon && { icon: currentRoute.meta.icon }),
                path: pathname,
                closable: true,
                route: currentRoute,
              };
              addTab(currentTabItem, { insertAt: 'tail', activate: true });
            }
          }
        });
      }
      return;
    }

    // 路径变化处理（初始化后）
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;

    const currentTab = tabs.find((tab) => tab.key === pathname);

    if (currentTab) {
      // tab 存在，只需激活
      if (activeKey !== pathname) {
        startTransition(() => {
          setActiveKey(pathname);
        });
      }
    } else {
      // tab 不存在，创建新 tab
      const currentRoute = findRouteByPath(pathname);
      if (currentRoute?.path) {
        const currentTabItem: TabItem = {
          key: pathname,
          label: currentRoute.meta?.title || pathname,
          ...(currentRoute.meta?.icon && { icon: currentRoute.meta.icon }),
          path: pathname,
          closable: true,
          route: currentRoute,
        };
        startTransition(() => {
          addTab(currentTabItem, { insertAt: 'tail', activate: true });
        });
      } else if (pathname !== homePath) {
        navigate(homePath, { replace: true });
      }
    }

    // tabs 为空时跳转
    if (tabs.length === 0 && pathname !== homePath) {
      navigate(homePath, { replace: true });
    }
  }, [
    pathname,
    tabs,
    activeKey,
    menus,
    homePath,
    findRouteByPath,
    addTab,
    setActiveKey,
    setTabs,
    navigate,
    startTransition,
  ]);

  // 监听用户退出登录事件（独立的副作用）
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user-storage') {
        try {
          const userData = JSON.parse(e.newValue || '{}');
          if (!userData.isLogin) {
            resetTabs();
            isInitializedRef.current = false;
          }
        } catch (error) {
          // 解析失败，忽略
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [resetTabs]);

  // 处理右键菜单显示 - 使用 useCallback 减少重新创建
  const handleContextMenu = useCallback((e: React.MouseEvent, tabKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenuTabKey(tabKey);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  }, []);

  // 处理右键菜单隐藏
  const handleContextMenuClose = useCallback(() => {
    setContextMenuVisible(false);
    setContextMenuTabKey('');
  }, []);

  // 处理tab点击切换 - 使用 startTransition 优化性能
  const handleTabClick = useCallback(
    (key: string, e?: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => {
      // 检查事件是否来自Dropdown菜单
      if (e?.target) {
        const target = e.target as HTMLElement;
        if (
          target.closest('.ant-dropdown-menu') ||
          target.closest('.ant-dropdown-menu-item') ||
          target.closest('[role="menuitem"]')
        ) {
          return;
        }
      }

      // 使用 startTransition 优化导航性能
      if (key !== pathname) {
        startTransition(() => {
          navigate(key, { replace: true });
        });
      }
    },
    [navigate, pathname, startTransition]
  );

  // 处理tab关闭 - 使用 startTransition 优化性能
  const handleTabEdit = useCallback(
    (e: React.Key | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>, action: 'add' | 'remove') => {
      if (action === 'remove' && typeof e === 'string') {
        startTransition(() => {
          const newActiveKey = removeTab(e);
          // 如果关闭的是当前激活的tab，跳转到新的激活tab
          if (e === activeKey && newActiveKey && newActiveKey !== pathname) {
            navigate(newActiveKey, { replace: true });
          }
        });
      }
    },
    [removeTab, activeKey, pathname, navigate, startTransition]
  );

  // 统一的菜单配置函数 - 减少重新创建，使用 stable 引用
  const getMenuItems = useCallback(
    (targetTabKey?: string): MenuProps['items'] => {
      const tabKey = targetTabKey || activeKey;
      const targetTab = tabs.find((tab) => tab.key === tabKey);

      if (!tabKey || !targetTab) return [];

      return [
        {
          key: 'close',
          label: t('common.close'),
          icon: <span>✕</span>,
          onClick: () => {
            startTransition(() => {
              const newActiveKey = removeTab(tabKey);
              if (tabKey === activeKey && newActiveKey && newActiveKey !== pathname) {
                navigate(newActiveKey, { replace: true });
              }
            });
          },
        },
        {
          key: 'pin',
          label: targetTab.closable ? t('common.pin') : t('common.unpin'),
          icon: <span>📌</span>,
          onClick: () => {
            startTransition(() => {
              if (targetTab.closable) {
                pinTab(tabKey);
              } else {
                unpinTab(tabKey);
              }
            });
          },
        },
        {
          key: 'reload',
          label: t('common.reload'),
          icon: <span>🔄</span>,
          onClick: () => {
            startTransition(() => {
              reloadTab(tabKey);
            });
          },
        },
        {
          key: 'openInNewWindow',
          label: t('common.openInNewWindow'),
          icon: <span>⧉</span>,
          onClick: () => {
            window.open(targetTab.path, '_blank');
          },
        },
        { type: 'divider' },
        {
          key: 'closeLeft',
          label: t('common.closeLeftTabs'),
          icon: <span>◀</span>,
          onClick: () => {
            startTransition(() => {
              const newActiveKey = closeLeftTabs(tabKey, homePath);
              if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
                navigate(newActiveKey, { replace: true });
              }
            });
          },
        },
        {
          key: 'closeRight',
          label: t('common.closeRightTabs'),
          icon: <span>▶</span>,
          onClick: () => {
            startTransition(() => {
              const newActiveKey = closeRightTabs(tabKey, homePath);
              if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
                navigate(newActiveKey, { replace: true });
              }
            });
          },
        },
        {
          key: 'closeOthers',
          label: t('common.closeOtherTabs'),
          icon: <span>❌</span>,
          onClick: () => {
            startTransition(() => {
              const newActiveKey = closeOtherTabs(tabKey, homePath);
              if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
                navigate(newActiveKey, { replace: true });
              }
            });
          },
        },
        {
          key: 'closeAll',
          label: t('common.closeAllTabs'),
          icon: <span>❌</span>,
          onClick: () => {
            startTransition(() => {
              const newActiveKey = closeAllTabs(homePath);
              if (newActiveKey && newActiveKey !== pathname) {
                navigate(newActiveKey, { replace: true });
              } else if (!newActiveKey && homePath) {
                navigate(homePath, { replace: true });
              }
            });
          },
        },
      ];
    },
    [
      activeKey,
      tabs,
      t,
      removeTab,
      navigate,
      pathname,
      pinTab,
      unpinTab,
      reloadTab,
      closeLeftTabs,
      closeRightTabs,
      closeOtherTabs,
      closeAllTabs,
      homePath,
      startTransition,
    ]
  );

  // 构建tab items - 使用 useMemo 缓存，减少重新计算
  const tabItems = useMemo((): TabsProps['items'] => {
    return tabs.map((tab) => ({
      key: tab.key,
      label: (
        <div className="flex items-center gap-1 tab-label" onContextMenu={(e) => handleContextMenu(e, tab.key)}>
          <span className="mr-0.5">{tab.icon && getIcon(tab.icon)}</span>
          <span>{t(tab.label)}</span>
        </div>
      ),
      closable: tab.closable && tabs.length > 1,
      children: null,
    }));
  }, [tabs, t, handleContextMenu]);

  // 如果没有tabs，不渲染组件
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
          {/* 下拉菜单 */}
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
};

export default React.memo(ActivityTabBar);
