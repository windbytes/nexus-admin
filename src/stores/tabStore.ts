import { create } from 'zustand';
import { type PersistOptions, persist } from 'zustand/middleware';
import type { RouteItem } from '@/types/route';

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  path: string;
  closable: boolean;
  component?: React.ComponentType;
  route?: RouteItem;
  reloadKey?: number; // 用于强制重新加载的时间戳
}

interface TabStore {
  // 打开的tabs
  tabs: TabItem[];
  // 当前激活的tab key
  activeKey: string;
  // 添加tab
  addTab: (tab: TabItem, options?: { insertAt?: 'head' | 'tail'; activate?: boolean }) => void;
  // 移除tab
  removeTab: (targetKey: string) => string;
  // 设置激活的tab
  setActiveKey: (key: string) => void;
  // 批量设置tabs（用于重新排序等场景）
  setTabs: (tabs: TabItem[], activeKey?: string) => void;
  // 关闭其他tabs
  closeOtherTabs: (targetKey: string, homePath?: string) => string;
  // 关闭左侧tabs
  closeLeftTabs: (targetKey: string, homePath?: string) => string;
  // 关闭右侧tabs
  closeRightTabs: (targetKey: string, homePath?: string) => string;
  // 关闭所有tabs
  closeAllTabs: (homePath?: string) => string;
  // 重新加载tab
  reloadTab: (targetKey: string) => void;
  // 固定tab
  pinTab: (targetKey: string) => void;
  // 取消固定tab
  unpinTab: (targetKey: string) => void;
  // 获取tab
  getTab: (key: string) => TabItem | undefined;
  // 检查tab是否存在
  hasTab: (key: string) => boolean;
  // 重置所有tabs（用于退出登录或页面刷新）
  resetTabs: () => void;
}

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeKey: '',

      addTab: (tab: TabItem, options?: { insertAt?: 'head' | 'tail'; activate?: boolean }) => {
        const { tabs, activeKey } = get();
        const existingTabIndex = tabs.findIndex((t) => t.key === tab.key);

        if (existingTabIndex === -1) {
          // 新tab，根据选项决定插入位置
          const { insertAt = 'tail', activate = true } = options || {};

          let newTabs: TabItem[];
          if (insertAt === 'head') {
            // 头插入：添加到数组开头
            newTabs = [tab, ...tabs];
          } else {
            // 尾插入：添加到数组末尾（默认行为）
            newTabs = [...tabs, tab];
          }

          // 根据activate选项决定是否激活新tab
          const newActiveKey = activate ? tab.key : activeKey;

          set({
            tabs: newTabs,
            activeKey: newActiveKey,
          });
        } else {
          // tab已存在，根据activate选项决定是否激活
          const { activate = true } = options || {};
          if (activate) {
            set({ activeKey: tab.key });
          }
        }
      },

      removeTab: (targetKey: string) => {
        const { tabs, activeKey } = get();
        const targetIndex = tabs.findIndex((tab) => tab.key === targetKey);

        if (targetIndex === -1) {
          return activeKey;
        }

        const newTabs = tabs.filter((tab) => tab.key !== targetKey);

        // 如果关闭的是当前激活的tab，需要激活其他tab
        let newActiveKey = activeKey;
        if (targetKey === activeKey) {
          if (newTabs.length === 0) {
            newActiveKey = '';
          } else if (targetIndex === 0) {
            // 关闭的是第一个，激活第一个
            newActiveKey = newTabs.length > 0 ? (newTabs[0]?.key ?? '') : '';
          } else {
            // 激活前一个
            newActiveKey = newTabs[targetIndex - 1]?.key ?? '';
          }
        }

        set({
          tabs: newTabs,
          activeKey: newActiveKey,
        });

        return newActiveKey;
      },

      setActiveKey: (key: string) => {
        set({ activeKey: key });
      },

      setTabs: (tabs: TabItem[], activeKey?: string) => {
        set({ tabs, activeKey: activeKey || '' });
      },

      closeOtherTabs: (targetKey: string, homePath?: string) => {
        const { tabs, activeKey } = get();
        const targetTab = tabs.find((tab) => tab.key === targetKey);
        if (targetTab) {
          // 保留目标tab和homePath的tab
          const homeTab = homePath ? tabs.find((tab) => tab.key === homePath) : null;

          let newTabs: TabItem[];

          // 始终保持 homeTab 在第一个
          if (homeTab && homeTab.key !== targetKey) {
            newTabs = [homeTab, targetTab];
          } else {
            newTabs = [targetTab];
          }

          // 如果当前激活的tab不在保留的tab中，需要激活目标tab
          const newActiveKey = newTabs.some((tab) => tab.key === activeKey) ? activeKey : targetKey;
          set({
            tabs: newTabs,
            activeKey: newActiveKey,
          });
          return newActiveKey;
        }
        return activeKey;
      },

      closeLeftTabs: (targetKey: string, homePath?: string) => {
        const { tabs, activeKey } = get();
        const targetIndex = tabs.findIndex((tab) => tab.key === targetKey);
        if (targetIndex > 0) {
          let newTabs = tabs.slice(targetIndex);

          // 如果homePath的tab在左侧被删除了，需要保留它
          if (homePath) {
            const homeTab = tabs.find((tab) => tab.key === homePath);
            if (homeTab && !newTabs.some((tab) => tab.key === homePath)) {
              newTabs = [homeTab, ...newTabs];
            }
          }

          // 如果当前激活的tab不在保留的tab中，需要激活目标tab
          const newActiveKey = newTabs.some((tab) => tab.key === activeKey) ? activeKey : targetKey;
          set({
            tabs: newTabs,
            activeKey: newActiveKey,
          });
          return newActiveKey;
        }
        return activeKey;
      },

      closeRightTabs: (targetKey: string, homePath?: string) => {
        const { tabs, activeKey } = get();
        const targetIndex = tabs.findIndex((tab) => tab.key === targetKey);
        if (targetIndex >= 0 && targetIndex < tabs.length - 1) {
          let newTabs = tabs.slice(0, targetIndex + 1);

          // 如果homePath的tab在右侧被删除了，需要保留它
          if (homePath) {
            const homeTab = tabs.find((tab) => tab.key === homePath);
            if (homeTab && !newTabs.some((tab) => tab.key === homePath)) {
              // 始终保持 homeTab 在第一个
              newTabs = [homeTab, ...newTabs];
            }
          }

          // 如果当前激活的tab不在保留的tab中，需要激活目标tab
          const newActiveKey = newTabs.some((tab) => tab.key === activeKey) ? activeKey : targetKey;
          set({
            tabs: newTabs,
            activeKey: newActiveKey,
          });
          return newActiveKey;
        }
        return activeKey;
      },

      closeAllTabs: (homePath?: string) => {
        const { tabs } = get();

        if (homePath) {
          // 保留homePath的tab
          const homeTab = tabs.find((tab) => tab.key === homePath);
          if (homeTab) {
            set({
              tabs: [homeTab],
              activeKey: homePath,
            });
            return homePath;
          }
        }

        // 如果没有homePath或找不到homeTab，清空所有tabs
        set({ tabs: [], activeKey: '' });
        return '';
      },

      reloadTab: (targetKey: string) => {
        const { tabs } = get();
        // 1. 更新 tab 的 reloadKey，强制重新挂载组件
        const newTabs = tabs.map((tab) => (tab.key === targetKey ? { ...tab, reloadKey: Date.now() } : tab));
        set({ tabs: newTabs });
      },

      pinTab: (targetKey: string) => {
        const { tabs } = get();
        const newTabs = tabs.map((tab) => (tab.key === targetKey ? { ...tab, closable: false } : tab));
        set({ tabs: newTabs });
      },

      unpinTab: (targetKey: string) => {
        const { tabs } = get();
        const newTabs = tabs.map((tab) => (tab.key === targetKey ? { ...tab, closable: true } : tab));
        set({ tabs: newTabs });
      },

      getTab: (key: string) => {
        const { tabs } = get();
        return tabs.find((tab) => tab.key === key);
      },

      hasTab: (key: string) => {
        const { tabs } = get();
        return tabs.some((tab) => tab.key === key);
      },

      resetTabs: () => {
        set({ tabs: [], activeKey: '' });
      },
    }),
    {
      name: 'tab-store',
      getStorage: () => localStorage,
    } as PersistOptions<TabStore>
  )
);
