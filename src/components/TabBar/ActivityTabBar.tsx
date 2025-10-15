import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Tabs, Dropdown, Button, type TabsProps, type MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { useTabStore, type TabItem } from '@/stores/tabStore';
import { useMenuStore } from '@/stores/store';
import { useUserStore } from '@/stores/userStore';
import { getIcon } from '@/utils/optimized-icons';
import type { RouteItem } from '@/types/route';
import { DownOutlined } from '@ant-design/icons';
import './tabBar.scss';

interface ActivityTabBarProps {
  className?: string;
}


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

  // 根据当前路径查找路由信息 - 使用 useMemo 缓存
  const findRouteByPath = useMemo(
    () => (path: string): RouteItem | undefined => {
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
  // 前一个pathname，用于防止重复处理
  const prevPathnameRef = useRef(pathname);

  // 【优化】合并所有 tab 管理逻辑到单个 useEffect
  React.useEffect(() => {
    // 1. 基础检查
    if (!menus.length || !homePath) return;
    if (pathname === '/login') return;

    // 2. 初始化逻辑（只执行一次）
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      
      if (tabs.length === 0) {
        // 首次加载，创建 homePath tab
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
            // 路径无效，跳转到 homePath
            navigate(homePath, { replace: true });
          }
        } else {
          setActiveKey(homePath);
        }
      } else {
        // 已有 tabs（可能从 localStorage 恢复），确保 homePath tab 存在且正确
        const homeRoute = findRouteByPath(homePath);
        if (homeRoute?.path) {
          const homeTabIndex = tabs.findIndex(tab => tab.key === homePath);
          
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
            // homePath tab 存在但不在第一位，重新排序
            const homeTab = tabs[homeTabIndex];
            if (homeTab) {
              const otherTabs = tabs.filter(tab => tab.key !== homePath);
              setTabs([homeTab, ...otherTabs], activeKey);
            }
          }
          
          // 确保 homePath tab 不可关闭
          const homeTab = tabs.find(tab => tab.key === homePath);
          if (homeTab?.closable) {
            const updatedTabs = tabs.map(tab => 
              tab.key === homePath ? { ...tab, closable: false } : tab
            );
            setTabs(updatedTabs, activeKey);
          }
        }

        // 激活当前路径对应的 tab
        const currentTab = tabs.find(tab => tab.key === pathname);
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
      }
      return;
    }

    // 3. 路径变化处理（初始化后）
    // 只有当 pathname 真正变化时才处理
    if (prevPathnameRef.current === pathname) {
      return;
    }
    prevPathnameRef.current = pathname;

    // 检查当前路径对应的 tab
    const currentTab = tabs.find(tab => tab.key === pathname);
    
    if (currentTab) {
      // tab 存在，只需激活
      if (activeKey !== pathname) {
        setActiveKey(pathname);
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
        addTab(currentTabItem, { insertAt: 'tail', activate: true });
      } else if (pathname !== homePath) {
        // 路径无效且不是 homePath，跳转到 homePath
        navigate(homePath, { replace: true });
      }
    }

    // 4. 确保 tabs 为空时跳转到 homePath
    if (tabs.length === 0 && pathname !== homePath) {
      navigate(homePath, { replace: true });
    }
  }, [pathname, tabs, activeKey, menus, homePath, findRouteByPath, addTab, setActiveKey, setTabs, navigate]);

  // 【优化】监听用户退出登录事件（独立的副作用）
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

  // 【优化】处理tab点击切换 - 直接导航，让 useEffect 处理状态更新
  const handleTabClick = useCallback(
    (key: string, e?: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => {
      // 检查事件是否来自Dropdown菜单
      if (e?.target) {
        const target = e.target as HTMLElement;
        if (target.closest('.ant-dropdown-menu') || 
            target.closest('.ant-dropdown-menu-item') ||
            target.closest('[role="menuitem"]')) {
          return;
        }
      }
      
      // 【优化】只执行导航，状态更新由 useEffect 统一处理
      if (key !== pathname) {
        navigate(key, { replace: true });
      }
    },
    [navigate, pathname],
  );

  // 【优化】处理tab关闭
  const handleTabEdit = useCallback(
    (e: React.Key | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>, action: 'add' | 'remove') => {
      if (action === 'remove' && typeof e === 'string') {
        const newActiveKey = removeTab(e);
        // 如果关闭的是当前激活的tab，跳转到新的激活tab
        if (e === activeKey && newActiveKey && newActiveKey !== pathname) {
          navigate(newActiveKey, { replace: true });
        }
      }
    },
    [removeTab, activeKey, pathname, navigate],
  );

  // 【优化】统一的菜单配置函数 - 修复依赖项
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
            const newActiveKey = removeTab(tabKey);
            if (tabKey === activeKey && newActiveKey && newActiveKey !== pathname) {
              navigate(newActiveKey, { replace: true });
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
          onClick: () => {
            reloadTab(tabKey);
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
            const newActiveKey = closeLeftTabs(tabKey, homePath);
            if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
              navigate(newActiveKey, { replace: true });
            }
          },
        },
        {
          key: 'closeRight',
          label: t('common.closeRightTabs'),
          icon: <span>▶</span>,
          onClick: () => {
            const newActiveKey = closeRightTabs(tabKey, homePath);
            if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
              navigate(newActiveKey, { replace: true });
            }
          },
        },
        {
          key: 'closeOthers',
          label: t('common.closeOtherTabs'),
          icon: <span>❌</span>,
          onClick: () => {
            const newActiveKey = closeOtherTabs(tabKey, homePath);
            if (newActiveKey && newActiveKey !== activeKey && newActiveKey !== pathname) {
              navigate(newActiveKey, { replace: true });
            }
          },
        },
        {
          key: 'closeAll',
          label: t('common.closeAllTabs'),
          icon: <span>❌</span>,
          onClick: () => {
            const newActiveKey = closeAllTabs(homePath);
            if (newActiveKey && newActiveKey !== pathname) {
              navigate(newActiveKey, { replace: true });
            } else if (!newActiveKey && homePath) {
              navigate(homePath, { replace: true });
            }
          },
        },
      ];
    },
    [activeKey, tabs, t, removeTab, navigate, pathname, pinTab, unpinTab, reloadTab, closeLeftTabs, closeRightTabs, closeOtherTabs, closeAllTabs, homePath],
  );

  // 【优化】构建tab items - 修复依赖项
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
