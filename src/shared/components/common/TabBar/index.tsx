import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  CloseSquareOutlined,
  DownOutlined,
  ExportOutlined,
  PushpinOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, type MenuProps, Tabs, type TabsProps } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useShallow } from 'zustand/shallow';
import { useMenuStore } from '@/shared/stores/preferences.store';
import { type TabItem, useTabStore } from '@/shared/stores/tab.store';
import { useUserStore } from '@/shared/stores/user.store';
import { getIcon } from '@/shared/utils/optimized-icons';
import { findMenuByPath } from '@/shared/utils/utils';
import './tabBar.css';

/**
 * 优化后的 ActivityTabBar
 * 1. 使用扁平化菜单结构，实现 O(1) 路由查找
 * 2. 移除 Render 阶段的 Side Effect (actionsRef)
 * 3. 合并初始化与路由同步逻辑
 * 4. 规范化 Context Menu 处理
 */
const TabBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { caches, menus } = useMenuStore(
    useShallow((state) => ({
      caches: state.caches,
      menus: state.menus,
    }))
  );
  const homePath = useUserStore((state) => state.homePath);

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

  useEffect(() => {
    if (!homePath || !menus.length || pathname === '/login') {
      return;
    }

    const createTab = (path: string): TabItem | null => {
      const route = findMenuByPath(path, caches);
      if (!route) {
        return null;
      }
      return {
        key: path,
        label: route.meta?.title || path,
        icon: route.meta?.icon,
        path,
        closable: path !== homePath,
        route,
      };
    };

    const isHome = pathname === homePath;
    const { tabs, activeKey, setTabs, setActiveKey, addTab } = useTabStore.getState();
    const targetTab = tabs.find((tab) => tab.key === pathname);

    if (tabs.length === 0) {
      const newTabs: TabItem[] = [];

      const homeTab = createTab(homePath);
      if (homeTab) {
        newTabs.push(homeTab);
      }

      if (!isHome) {
        const currentTab = createTab(pathname);
        if (currentTab) {
          newTabs.push(currentTab);
        }
      }

      if (newTabs.length > 0) {
        setTabs(newTabs, pathname);
      } else if (!isHome) {
        navigate({ to: homePath, replace: true });
      }
      return;
    }

    if (targetTab) {
      if (activeKey !== pathname) {
        setActiveKey(pathname);
      }
      return;
    }

    const newTab = createTab(pathname);
    if (newTab) {
      addTab(newTab, { insertAt: 'tail', activate: true });
    }
  }, [pathname, menus.length, homePath, navigate, caches]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user-storage') {
        try {
          const userData = JSON.parse(e.newValue || '{}');
          if (!userData.isLogin) {
            tabState.resetTabs();
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tabState.resetTabs]);

  const handleTabClick = (key: string) => {
    if (key !== pathname) {
      navigate({ to: key });
    }
  };

  const handleTabEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove' && typeof targetKey === 'string') {
      const { removeTab, activeKey } = useTabStore.getState();
      const nextKey = removeTab(targetKey);
      if (targetKey === activeKey && nextKey) {
        navigate({ to: nextKey, replace: true });
      }
    }
  };

  const handleMenuAction = (key: string, tabKey: string) => {
    const {
      removeTab,
      pinTab,
      unpinTab,
      reloadTab,
      closeLeftTabs,
      closeRightTabs,
      closeOtherTabs,
      closeAllTabs,
      tabs,
      activeKey,
    } = tabState;

    const currentTab = tabs.find((tab) => tab.key === tabKey);
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
        if (currentTab?.path) {
          window.open(currentTab.path, '_blank');
        }
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

    if (nextActiveKey && nextActiveKey !== activeKey && nextActiveKey !== pathname) {
      navigate({ to: nextActiveKey, replace: true });
    }
  };

  const getMenuItems = (tabKey: string): MenuProps['items'] => {
    const tab = tabState.tabs.find((item) => item.key === tabKey);
    if (!tab) {
      return [];
    }
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
  };

  const tabItems: TabsProps['items'] = tabState.tabs.map((tab) => ({
    key: tab.key,
    label: (
      <Dropdown
        menu={{
          items: getMenuItems(tab.key),
          onClick: ({ key }) => handleMenuAction(key, tab.key),
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

  if (!tabState.tabs.length) {
    return null;
  }

  return (
    <div className="tab-bar flex w-full">
      <Tabs
        type="editable-card"
        activeKey={tabState.activeKey}
        onTabClick={handleTabClick}
        onEdit={handleTabEdit}
        items={tabItems}
        hideAdd
        tabBarGutter={0}
        className="tab-bar-tabs flex-1"
      />

      <div className="tab-bar-actions w-[40px] flex items-center justify-center border-l border-gray-200">
        <Dropdown
          menu={{
            items: getMenuItems(tabState.activeKey),
            onClick: ({ key }) => handleMenuAction(key, tabState.activeKey),
          }}
          placement="bottomRight"
          trigger={['click', 'hover']}
        >
          <Button type="text" size="small" icon={<DownOutlined />} className="flex items-center justify-center" />
        </Dropdown>
      </div>
    </div>
  );
};

TabBar.displayName = 'TabBar';

export default TabBar;
