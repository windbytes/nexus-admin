import React, { useCallback, useMemo, useRef } from 'react';
import { Tabs, Dropdown, Button, type TabsProps, type MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useTabStore, type TabItem } from '@/stores/tabStore';
import { useMenuStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import { getIcon } from '@/utils/optimized-icons';
import type { RouteItem } from '@/types/route';
import { DownOutlined } from '@ant-design/icons';
import './tabBar.scss';

interface TabBarProps {
  className?: string;
}

const TabBar: React.FC<TabBarProps> = ({ className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 使用ref来跟踪是否正在关闭tab，避免useEffect重复执行
  const isClosingTabRef = useRef(false);
  
  // 用于右键菜单的状态管理
  const [contextMenuVisible, setContextMenuVisible] = React.useState(false);
  const [contextMenuPosition, setContextMenuPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextMenuTabKey, setContextMenuTabKey] = React.useState<string>('');

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
  } = useTabStore();
  const { menus } = useMenuStore();
  const { homePath } = useUserStore();

  // 根据当前路径查找路由信息
  const findRouteByPath = useCallback(
    (path: string): RouteItem | undefined => {
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

      return searchRoute(menus, path);
    },
    [menus],
  );

  // 初始化标记，避免重复初始化
  const isInitializedRef = useRef(false);

  // 页面刷新时的状态恢复逻辑
  React.useEffect(() => {
    // 只有在有菜单数据且有homePath且未初始化时才执行
    if (!isInitializedRef.current && menus.length > 0 && homePath) {
      isInitializedRef.current = true;
      
      // 如果当前没有tabs，说明是首次加载，需要初始化
      if (tabs.length === 0) {
        // 首先创建homePath的tab（第一个位置）
        const homeRoute = findRouteByPath(homePath);
        if (homeRoute?.path) {
          const homeTabItem: TabItem = {
            key: homePath,
            label: homeRoute.meta?.title || homePath,
            icon: homeRoute.meta?.icon,
            path: homePath,
            closable: false, // 第一个tab不可关闭
            route: homeRoute,
          };

          // 使用头插入，但不激活（根据当前路径决定激活哪个）
          addTab(homeTabItem, { insertAt: 'head', activate: false });
        }

        // 然后检查当前路径是否有效（在菜单中存在）
        const currentRoute = findRouteByPath(pathname);

        if (currentRoute?.path && pathname !== homePath) {
          // 如果当前路径有效且不是homePath，创建对应的tab
          const currentTabItem: TabItem = {
            key: pathname,
            label: currentRoute.meta?.title || pathname,
            icon: currentRoute.meta?.icon,
            path: pathname,
            closable: true,
            route: currentRoute,
          };

          // 使用尾插入，激活当前页面
          addTab(currentTabItem, { insertAt: 'tail', activate: true });
        } else if (pathname === homePath) {
          // 如果当前路径就是homePath，激活homePath的tab
          setActiveKey(homePath);
        } else {
          // 如果当前路径无效且不是homePath，跳转到homePath
          navigate(homePath, { replace: true });
        }
      } else {
        // 页面刷新时，tabs已经存在，需要确保状态正确
        // 1. 确保homePath的tab存在且不可关闭
        const homeTab = tabs.find(tab => tab.key === homePath);
        if (homeTab) {
          // 确保homePath的tab不可关闭
          if (homeTab.closable) {
            const updatedTabs = tabs.map(tab => 
              tab.key === homePath ? { ...tab, closable: false } : tab
            );
            setTabs(updatedTabs, activeKey);
          }
        } else {
          // 如果homePath的tab不存在，需要添加
          const homeRoute = findRouteByPath(homePath);
          if (homeRoute?.path) {
            const homeTabItem: TabItem = {
              key: homePath,
              label: homeRoute.meta?.title || homePath,
              icon: homeRoute.meta?.icon,
              path: homePath,
              closable: false,
              route: homeRoute,
            };
            addTab(homeTabItem, { insertAt: 'head', activate: false });
          }
        }

        // 2. 确保当前路径对应的tab存在并激活
        const currentTab = tabs.find(tab => tab.key === pathname);
        if (!currentTab && pathname !== homePath) {
          const currentRoute = findRouteByPath(pathname);
          if (currentRoute?.path) {
            const currentTabItem: TabItem = {
              key: pathname,
              label: currentRoute.meta?.title || pathname,
              icon: currentRoute.meta?.icon,
              path: pathname,
              closable: true,
              route: currentRoute,
            };
            addTab(currentTabItem, { insertAt: 'tail', activate: true });
          }
        } else if (currentTab) {
          // 如果当前路径的tab存在，激活它
          setActiveKey(pathname);
        } else if (pathname === homePath) {
          // 如果当前路径就是homePath，确保激活homePath的tab
          setActiveKey(homePath);
        }

        // 3. 确保homePath的tab在第一个位置
        const homeTabIndex = tabs.findIndex(tab => tab.key === homePath);
        if (homeTabIndex > 0) {
          const homeTab = tabs[homeTabIndex];
          const otherTabs = tabs.filter(tab => tab.key !== homePath);
          const newTabs = [homeTab, ...otherTabs];
          setTabs(newTabs, activeKey);
        }
      }
    }
  }, [menus, homePath, findRouteByPath, navigate, tabs, activeKey, addTab, setActiveKey, setTabs, pathname]);

  // 处理路径变化时的tab激活逻辑
  React.useEffect(() => {
    // 如果正在关闭tab，跳过执行
    if (isClosingTabRef.current) {
      return;
    }
    
    // 只有在初始化完成后才处理路径变化
    if (isInitializedRef.current && menus.length > 0 && homePath && tabs.length > 0) {
      // 确保当前路径对应的tab被激活
      const currentTab = tabs.find(tab => tab.key === pathname);
      if (currentTab && activeKey !== pathname) {
        setActiveKey(pathname);
      } else if (!currentTab && pathname !== homePath) {
        // 如果当前路径的tab不存在且不是homePath，创建并激活它
        const currentRoute = findRouteByPath(pathname);
        if (currentRoute?.path) {
          const currentTabItem: TabItem = {
            key: pathname,
            label: currentRoute.meta?.title || pathname,
            icon: currentRoute.meta?.icon,
            path: pathname,
            closable: true,
            route: currentRoute,
          };
          addTab(currentTabItem, { insertAt: 'tail', activate: true });
        }
      }
    }
  }, [pathname, tabs, activeKey, setActiveKey, menus, homePath, findRouteByPath, addTab]);

  // 确保 homePath 对应的 tab 始终存在且不可关闭（在tabs变化时检查）
  React.useEffect(() => {
    if (menus.length > 0 && homePath && tabs.length > 0 && isInitializedRef.current) {
      const homeRoute = findRouteByPath(homePath);
      const homeTabExists = tabs.some((tab) => tab.key === homePath);

      // 如果homePath的tab不存在，需要添加
      if (homeRoute?.path && !homeTabExists) {
        const homeTabItem: TabItem = {
          key: homePath,
          label: homeRoute.meta?.title || homePath,
          icon: homeRoute.meta?.icon,
          path: homePath,
          closable: false, // 第一个tab不可关闭
          route: homeRoute,
        };

        // 使用头插入，不激活，保持当前激活状态
        addTab(homeTabItem, { insertAt: 'head', activate: false });
      }
      // 如果homePath的tab存在但不在第一个位置，需要重新排序
      else if (homeRoute?.path && homeTabExists) {
        const homeTabIndex = tabs.findIndex((tab) => tab.key === homePath);
        // 只有当homePath不在第一个位置时才重新排序，避免不必要的操作
        if (homeTabIndex > 0) {
          const homeTab = tabs[homeTabIndex];
          const otherTabs = tabs.filter((tab) => tab.key !== homePath);
          const newTabs = [homeTab, ...otherTabs];

          // 使用setTabs方法，一次性更新状态
          setTabs(newTabs, activeKey);
        }
      }
    }
  }, [menus, homePath, findRouteByPath, tabs, activeKey, addTab, setTabs]);


  // 处理路径变化时的tab管理逻辑（仅在初始化完成后执行）
  React.useEffect(() => {
    // 如果正在关闭tab，跳过执行
    if (isClosingTabRef.current) {
      isClosingTabRef.current = false;
      return;
    }

    // 只有在初始化完成后才处理路径变化
    if (!isInitializedRef.current || !menus.length || !homePath) return;

    if (!pathname || pathname === '/login') return;

    // 如果当前没有tabs，说明是关闭所有tabs后的情况，需要跳转到首页
    if (tabs.length === 0) {
      if (homePath && pathname !== homePath) {
        navigate(homePath, { replace: true });
      }
      return;
    }

    // 如果tabs存在但只有一个且是homePath，且当前路径不是homePath，则添加新tab
    if (tabs.length === 1 && tabs[0].key === homePath && pathname !== homePath) {
      const route = findRouteByPath(pathname);
      if (route) {
        const tabItem: TabItem = {
          key: pathname,
          label: route.meta?.title || pathname,
          icon: route.meta?.icon,
          path: pathname,
          closable: true,
          route,
        };
        useTabStore.getState().addTab(tabItem);
      }
      return;
    }

    // 如果tabs存在且超过1个，检查当前路径对应的tab
    if (tabs.length > 1) {
      const route = findRouteByPath(pathname);
      if (!route) return;

      const tabItem: TabItem = {
        key: pathname,
        label: route.meta?.title || pathname,
        icon: route.meta?.icon,
        path: pathname,
        closable: true,
        route,
      };

      // 检查tab是否已存在
      const existingTab = tabs.find((tab) => tab.key === pathname);
      if (!existingTab) {
        // 新tab，添加到store
        useTabStore.getState().addTab(tabItem);
      } else {
        // tab已存在，只激活它
        setActiveKey(pathname);
      }
    }
  }, [pathname, tabs, homePath, findRouteByPath, setActiveKey, navigate, menus]);

  // 监听用户退出登录事件（不监听页面刷新）
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 监听 localStorage 变化，检测用户登录状态变化
      if (e.key === 'user-storage') {
        try {
          const userData = JSON.parse(e.newValue || '{}');
          if (!userData.isLogin) {
            // 用户退出登录，清空所有tab
            resetTabs();
          }
        } catch (error) {
          // 解析失败，忽略
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [resetTabs]);

  // 处理右键菜单显示
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, tabKey: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      setContextMenuTabKey(tabKey);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setContextMenuVisible(true);
    },
    []
  );

  // 处理右键菜单隐藏
  const handleContextMenuClose = useCallback(() => {
    setContextMenuVisible(false);
    setContextMenuTabKey('');
  }, []);

  // 处理tab点击切换
  const handleTabClick = useCallback(
    (key: string, e?: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => {
      // 检查事件是否来自Dropdown菜单，如果是则阻止tab切换
      if (e?.target) {
        const target = e.target as HTMLElement;
        // 检查点击的元素是否在Dropdown菜单内部
        if (target.closest('.ant-dropdown-menu') || 
            target.closest('.ant-dropdown-menu-item') ||
            target.closest('[role="menuitem"]')) {
          return; // 阻止tab切换
        }
      }
      
      setActiveKey(key);
      // 使用 replace 模式，替换当前历史记录，防止用户通过浏览器后退按钮回到之前的菜单
      navigate(key, { replace: true });
    },
    [setActiveKey, navigate],
  );

  // 处理tab关闭
  const handleTabEdit = useCallback(
    (e: React.Key | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>, action: 'add' | 'remove') => {
      if (action === 'remove' && typeof e === 'string') {
        // 标记正在关闭tab
        isClosingTabRef.current = true;
        const newActiveKey = removeTab(e);
        // 如果关闭的是当前激活的tab，需要跳转到新的激活tab
        if (e === activeKey && newActiveKey) {
          navigate(newActiveKey, { replace: true });
          // 延迟重置标记，确保路径变化的useEffect不会在pathname还是旧值时执行
          setTimeout(() => {
            isClosingTabRef.current = false;
          }, 0);
        } else {
          // 如果没有导航，立即重置标记
          isClosingTabRef.current = false;
        }
      }
    },
    [removeTab, navigate, activeKey],
  );

  // 统一的菜单配置函数
  const getMenuItems = useCallback(
    (targetTabKey?: string): MenuProps['items'] => {
      const tabKey = targetTabKey || activeKey;
      const targetTab = tabs.find(tab => tab.key === tabKey);
      
      if (!tabKey || !targetTab) return [];

      return [
        {
          key: 'close',
          label: t('common.close'),
          icon: <span>✕</span>,
          onClick: () => {
            // 标记正在关闭tab
            isClosingTabRef.current = true;
            const newActiveKey = removeTab(tabKey);
            // 如果关闭的是当前激活的tab，需要跳转到新的激活tab
            if (tabKey === activeKey && newActiveKey) {
              navigate(newActiveKey, { replace: true });
              // 延迟重置标记，确保路径变化的useEffect不会在pathname还是旧值时执行
              setTimeout(() => {
                isClosingTabRef.current = false;
              }, 0);
            } else {
              // 如果没有导航，立即重置标记
              isClosingTabRef.current = false;
            }
          },
        },
        {
          key: 'pin',
          label: targetTab.closable ? t('common.pin') : t('common.unpin'),
          icon: <span>📌</span>,
          onClick: () => {
            if (targetTab.closable) {
              pinTab(tabKey);
            } else {
              unpinTab(tabKey);
            }
          },
        },
        {
          key: 'reload',
          label: t('common.reload'),
          icon: <span>🔄</span>,
          onClick: () => reloadTab(tabKey),
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
            // 标记正在关闭tab
            isClosingTabRef.current = true;
            const newActiveKey = closeLeftTabs(tabKey, homePath);
            // 如果当前激活的tab被关闭了，需要跳转到新的激活tab
            if (newActiveKey && newActiveKey !== activeKey) {
              navigate(newActiveKey, { replace: true });
              // 延迟重置标记，确保路径变化的useEffect不会在pathname还是旧值时执行
              setTimeout(() => {
                isClosingTabRef.current = false;
              }, 0);
            } else {
              // 如果没有导航，立即重置标记
              isClosingTabRef.current = false;
            }
          },
        },
        {
          key: 'closeRight',
          label: t('common.closeRightTabs'),
          icon: <span>▶</span>,
          onClick: () => {
            // 标记正在关闭tab
            isClosingTabRef.current = true;
            const newActiveKey = closeRightTabs(tabKey, homePath);
            // 如果当前激活的tab被关闭了，需要跳转到新的激活tab
            if (newActiveKey && newActiveKey !== activeKey) {
              navigate(newActiveKey, { replace: true });
              // 延迟重置标记，确保路径变化的useEffect不会在pathname还是旧值时执行
              setTimeout(() => {
                isClosingTabRef.current = false;
              }, 0);
            } else {
              // 如果没有导航，立即重置标记
              isClosingTabRef.current = false;
            }
          },
        },
        {
          key: 'closeOthers',
          label: t('common.closeOtherTabs'),
          icon: <span>❌</span>,
          onClick: () => {
            // 标记正在关闭tab
            isClosingTabRef.current = true;
            const newActiveKey = closeOtherTabs(tabKey, homePath);
            // 如果当前激活的tab被关闭了，需要跳转到新的激活tab
            if (newActiveKey && newActiveKey !== activeKey) {
              navigate(newActiveKey, { replace: true });
              // 延迟重置标记，确保路径变化的useEffect不会在pathname还是旧值时执行
              setTimeout(() => {
                isClosingTabRef.current = false;
              }, 0);
            } else {
              // 如果没有导航，立即重置标记
              isClosingTabRef.current = false;
            }
          },
        },
        {
          key: 'closeAll',
          label: t('common.closeAllTabs'),
          icon: <span>❌</span>,
          onClick: () => {
            // 标记正在关闭tab
            isClosingTabRef.current = true;
            const newActiveKey = closeAllTabs(homePath);
            // 关闭所有tab后跳转到新的激活tab
            if (newActiveKey) {
              // 如果当前不在homePath，需要跳转到homePath
              if (pathname !== homePath) {
                navigate(newActiveKey, { replace: true });
                // 延迟重置标记，确保路径变化的useEffect不会在pathname还是旧值时执行
                setTimeout(() => {
                  isClosingTabRef.current = false;
                }, 0);
              } else {
                // 如果没有导航，立即重置标记
                isClosingTabRef.current = false;
              }
            } else if (homePath) {
              navigate(homePath, { replace: true });
              // 延迟重置标记，确保路径变化的useEffect不会在pathname还是旧值时执行
              setTimeout(() => {
                isClosingTabRef.current = false;
              }, 0);
            } else {
              navigate('/', { replace: true });
              // 延迟重置标记，确保路径变化的useEffect不会在pathname还是旧值时执行
              setTimeout(() => {
                isClosingTabRef.current = false;
              }, 0);
            }
          },
        },
      ];
    },
    [t, tabs, activeKey, removeTab, navigate, pinTab, unpinTab, reloadTab, closeLeftTabs, closeRightTabs, closeOtherTabs, closeAllTabs, homePath, pathname],
  );

  // 构建tab items
  const tabItems = useMemo((): TabsProps['items'] => {
    return tabs.map((tab) => ({
      key: tab.key,
      label: (
        <div 
          className="flex items-center gap-1 tab-label"
          onContextMenu={(e) => handleContextMenu(e, tab.key)}
        >
          <span className="mr-0.5">{tab.icon && getIcon(tab.icon)}</span>
          <span>{t(tab.label)}</span>
        </div>
      ),
      closable: tab.closable && tabs.length > 1, // 只有一个tab时不显示关闭按钮
      children: null, // 内容由KeepAlive组件渲染
    }));
  }, [tabs, handleContextMenu]);

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
          items={tabItems}
          size="middle"
          hideAdd
          className="tab-bar-tabs"
          style={{ margin: 0, flex: 1 }}
        />

        {/* 右侧功能区域 */}
        <div className="tab-bar-actions">
          {/* 下拉菜单 */}
          <Dropdown menu={{ items: getMenuItems() }} placement="bottomRight" trigger={['click']}>
            <Button type="text" size="small" icon={<DownOutlined />} className="tab-action-btn" />
          </Dropdown>
        </div>
      </div>

      {/* 统一的右键菜单 */}
      <Dropdown
        menu={{ items: getMenuItems(contextMenuTabKey) }}
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

export default TabBar;
