import { useMenuStore } from '@/stores/store';
import { useTabStore, type TabItem } from '@/stores/tabStore';
import { useUserStore } from '@/stores/userStore';
import { getIcon } from '@/utils/optimized-icons';
import { findMenuByPath } from '@/utils/utils';
import { ArrowLeftOutlined, ArrowRightOutlined, CloseOutlined, CloseSquareOutlined, DownOutlined, ExportOutlined, PushpinOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button, Dropdown, Tabs, type MenuProps, type TabsProps } from 'antd';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import './tabBar.scss';

interface TabBarProps {
  className?: string;
}

/**
 * 优化后的 ActivityTabBar
 * 1. 使用 useMemo 扁平化菜单结构，实现 O(1) 路由查找
 * 2. 移除 Render 阶段的 Side Effect (actionsRef)
 * 3. 合并初始化与路由同步逻辑
 * 4. 规范化 Context Menu 处理
 */
const TabBar: React.FC<TabBarProps> = memo(({ className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // 仅订阅 pathname，避免不必要的重新渲染
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // 1. 使用扁平化路由映射 (O(1) 查找
  const { caches, menus } = useMenuStore(useShallow((state) => ({
    caches: state.caches,
    menus: state.menus,
  })));
  const homePath = useUserStore((state) => state.homePath);

  // Zustand Selector 优化
  const tabState = useTabStore(
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

  // 2. 创建 Tab 对象辅助函数
  const createTab = useCallback(
    (path: string): TabItem | null => {
      const route = findMenuByPath(path, caches);
      if (!route) return null;
      return {
        key: path,
        label: route.meta?.title || path,
        icon: route.meta?.icon, // 假设 icon 是 string
        path,
        closable: path !== homePath, // 首页通常不可关闭
        route,
      };
    },
    [caches, homePath]
  );

  // 3. 核心逻辑：同步 URL 和 Tabs 状态
  // 合并了初始化和路径变化的逻辑，更加健壮
  useEffect(() => {
    if (!homePath || !menus.length || pathname === '/login') return;

    const isHome = pathname === homePath;
    const targetTab = tabState.tabs.find((tab) => tab.key === pathname);

    // 场景 A: Tabs 为空 (通常是首次加载或刷新)
    if (tabState.tabs.length === 0) {
      const newTabs: TabItem[] = [];
      
      // 必须保证有首页
      const homeTab = createTab(homePath);
      if (homeTab) newTabs.push(homeTab);

      // 如果当前不是首页，也加入当前页
      if (!isHome) {
        const currentTab = createTab(pathname);
        if (currentTab) newTabs.push(currentTab);
      }

      if (newTabs.length > 0) {
        tabState.setTabs(newTabs, pathname);
      } else if (!isHome) {
        // 如果找不到路由定义，回退到首页
        navigate({ to: homePath, replace: true });
      }
      return;
    }

    // 场景 B: Tab 已存在，仅激活
    if (targetTab) {
      if (tabState.activeKey !== pathname) {
        tabState.setActiveKey(pathname);
      }
      return;
    }

    // 场景 C: Tab 不存在，添加新 Tab
    const newTab = createTab(pathname);
    if (newTab) {
      tabState.addTab(newTab, { insertAt: 'tail', activate: true });
    }
  }, [pathname, menus.length, homePath]); // 依赖 tabState.tabs 会导致死循环，这里只依赖 length 或交由 zustand 内部判断

  // 4. 监听登出清理
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user-storage') {
        try {
          const userData = JSON.parse(e.newValue || '{}');
          if (!userData.isLogin) {
            tabState.resetTabs();
          }
        } catch (e) { console.error(e); }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tabState.resetTabs]);

  // 5. 事件处理器 - 使用 useCallback 保持稳定
  const handleTabClick = useCallback((key: string) => {
    if (key !== pathname) {
      navigate({ to: key });
    }
  }, [pathname, navigate]);

  const handleTabEdit = useCallback((targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove' && typeof targetKey === 'string') {
      const nextKey = tabState.removeTab(targetKey);
      // 只有当关闭的是当前激活的 tab 时才跳转
      if (targetKey === tabState.activeKey && nextKey) {
        navigate({ to: nextKey, replace: true });
      }
    }
  }, [tabState, navigate, pathname]);

  // 6. 菜单 Actions 逻辑
  const handleMenuAction = useCallback((key: string, tabKey: string) => {
    const { 
      removeTab, pinTab, unpinTab, reloadTab, 
      closeLeftTabs, closeRightTabs, closeOtherTabs, closeAllTabs, 
      tabs, activeKey 
    } = tabState;

    const currentTab = tabs.find(t => t.key === tabKey);
    let nextActiveKey: string | undefined | null = null;

    switch (key) {
      case 'close':
        nextActiveKey = removeTab(tabKey);
        break;
      case 'pin':
        currentTab?.closable ? pinTab(tabKey) : unpinTab(tabKey);
        break;
      case 'reload':
        reloadTab(tabKey);
        break;
      case 'openInNewWindow':
        if (currentTab?.path) window.open(currentTab.path, '_blank');
        break;
      case 'closeLeft':
        nextActiveKey = closeLeftTabs(tabKey, homePath);
        break;
      case 'closeRight':
        nextActiveKey = closeRightTabs(tabKey, homePath);
        break;
      case 'closeOthers':
        nextActiveKey = closeOtherTabs(tabKey, homePath);
        break;
      case 'closeAll':
        nextActiveKey = closeAllTabs(homePath);
        break;
    }

    // 统一处理导航
    if (nextActiveKey && nextActiveKey !== activeKey && nextActiveKey !== pathname) {
      navigate({ to: nextActiveKey, replace: true });
    }
  }, [tabState, homePath, pathname, navigate]);

  // 生成菜单项配置
  const getMenuItems = useCallback((tabKey: string): MenuProps['items'] => {
    const tab = tabState.tabs.find(t => t.key === tabKey);
    if (!tab) return [];
    const isClosable = tab.closable;

    return [
      { key: 'close', label: t('common.close'), icon: <CloseOutlined />, disabled: !isClosable },
      { key: 'pin', label: isClosable ? t('common.pin') : t('common.unpin'), icon: <PushpinOutlined /> },
      { key: 'reload', label: t('common.reload'), icon: <ReloadOutlined /> },
      { key: 'openInNewWindow', label: t('common.openInNewWindow'), icon: <ExportOutlined /> },
      { type: 'divider' },
      { key: 'closeLeft', label: t('common.closeLeftTabs'), icon: <ArrowLeftOutlined /> },
      { key: 'closeRight', label: t('common.closeRightTabs'), icon: <ArrowRightOutlined /> },
      { key: 'closeOthers', label: t('common.closeOtherTabs'), icon: <CloseSquareOutlined /> },
      { key: 'closeAll', label: t('common.closeAllTabs'), icon: <CloseSquareOutlined /> },
    ];
  }, [tabState.tabs, t]);

  // 7. 渲染 Tab Items
  const tabItems = useMemo<TabsProps['items']>(() => {
    return tabState.tabs.map((tab) => ({
      key: tab.key,
      label: (
        <Dropdown
          menu={{ 
            items: getMenuItems(tab.key), 
            onClick: ({ key }) => handleMenuAction(key, tab.key) 
          }}
          trigger={['contextMenu']}
        >
          <div className="flex items-center gap-1 tab-label h-full">
            {tab.icon && <span className="mr-0.5">{getIcon(tab.icon)}</span>}
            <span>{t(tab.label)}</span>
          </div>
        </Dropdown>
      ),
      closable: tab.closable,
    }));
  }, [tabState.tabs, t, getMenuItems, handleMenuAction]);

  if (!tabState.tabs.length) return null;

  return (
    <div className={`tab-bar ${className || ''}`}>
      <div className="tab-bar-content flex w-full">
        <Tabs
          type="editable-card"
          activeKey={tabState.activeKey}
          onTabClick={handleTabClick}
          onEdit={handleTabEdit}
          items={tabItems}
          size="middle"
          hideAdd
          tabBarGutter={0}
          className="tab-bar-tabs flex-1"
        />
        
        {/* 右侧功能区：下拉菜单操作当前激活的 Tab */}
        <div className="tab-bar-actions w-[40px] flex items-center justify-center border-l border-gray-200">
          <Dropdown 
            menu={{ 
              items: getMenuItems(tabState.activeKey), 
              onClick: ({ key }) => handleMenuAction(key, tabState.activeKey) 
            }} 
            placement="bottomRight" 
            trigger={['click', 'hover']}
          >
            <Button type="text" size="small" icon={<DownOutlined />} className="flex items-center justify-center" />
          </Dropdown>
        </div>
      </div>
    </div>
  );
});

TabBar.displayName = 'TabBar';

export default TabBar;