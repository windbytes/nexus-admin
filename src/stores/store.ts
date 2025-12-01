import { create } from 'zustand';
import { type PersistOptions, persist } from 'zustand/middleware';
import { defaultPreferences } from '@/config/defaultPreferences';
import type { RouteItem } from '@/types/route';
import { buildMenuCaches, type MenuCaches } from '@/utils/utils';
import type { Preferences } from './storeState';

// 定义category和key的类型
export type Category = keyof Preferences;
export type SettingKey<T extends Category> = keyof Preferences[T];

/**
 * 获取 preferences 中的值
 * @param preferences - 全局状态库中的 preferences
 * @param category - 类别
 * @param key - 设置键
 * @returns 设置值
 */
const getPreferenceValue = <T extends Category, K extends SettingKey<T>>(
  preferences: Preferences,
  category: T,
  pKey: K
): Preferences[T][K] => {
  return preferences[category][pKey];
};

const emptyCaches: MenuCaches = {
  pathMap: new Map(),
  ancestorsMap: new Map(),
  routeToMenuPathMap: new Map(),
};

/**
 * 定义状态对象
 */
interface MenuStore {
  // 菜单状态
  menus: RouteItem[];
  caches: MenuCaches;
  setMenus: (menus: RouteItem[]) => void;
}

interface PreferencesStore {
  // 系统配置状态
  preferences: Preferences;
  // 更新全局状态
  updatePreferences: (category: Category, key: string, value: any) => void;
  // 重置全局状态
  resetPreferences: () => void;
}

// 创建菜单store
const useMenuStore = create<MenuStore>((set) => ({
  // 菜单状态
  menus: [],
  caches: emptyCaches,
  setMenus: (menus: RouteItem[]) => {
    const caches: MenuCaches = buildMenuCaches(menus);
    set({ menus, caches });
  },
}));

// 创建全局设置store
const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      // 系统配置状态
      preferences: defaultPreferences,
      // 更新全局状态
      updatePreferences: (category: Category, key: string, value: any) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [category]: {
              ...state.preferences[category],
              [key]: value,
            },
          },
        })),
      // 重置全局状态
      resetPreferences: () => set({ preferences: defaultPreferences }),
    }),
    {
      name: 'preferences',
      getStorage: () => localStorage,
    } as PersistOptions<PreferencesStore>
  )
);

export { useMenuStore, usePreferencesStore, getPreferenceValue };
