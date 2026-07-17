import { create } from 'zustand';
import type { ThemeMode } from '@/app/bootstrap/theme';

export type AppLocale = 'zh-CN' | 'en-US';

export interface SettingState {
  locale: AppLocale;
  themeMode: ThemeMode;
  compact: boolean;
  colorPrimary: string;
  colorError: string;
  colorSuccess: string;
  colorWarning: string;
  radius: number;
  setLocale: (locale: AppLocale) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setCompact: (compact: boolean) => void;
}

/**
 * 全局设置状态（Zustand）
 *
 * 维护从 syndra-admin 入口 Provider 拆出的语言、主题、圆角、紧凑模式等偏好。
 */
export const useSettingStore = create<SettingState>((set) => ({
  locale: 'zh-CN',
  themeMode: 'light',
  compact: false,
  colorPrimary: '#1677ff',
  colorError: '#ff4d4f',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  radius: 6,
  setLocale: (locale) => set({ locale }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setCompact: (compact) => set({ compact }),
}));
