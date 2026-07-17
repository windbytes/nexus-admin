import { AlertOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import type React from 'react';
import type { BuiltinThemePreset, ThemeModeType } from '@/types/app';

export interface LanguageOption {
  label: string;
  value: 'en-US' | 'zh-CN';
}

/**
 * Supported languages
 */
export const SUPPORT_LANGUAGES: LanguageOption[] = [
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: 'English',
    value: 'en-US',
  },
];

// 预设的theme
export const THEME_PRESET: Array<{
  icon: React.ReactNode;
  name: ThemeModeType;
  selected?: boolean;
}> = [
  {
    icon: <SunOutlined style={{ fontSize: '20px', margin: '0 36px' }} />,
    name: 'light',
    selected: true,
  },
  {
    icon: <MoonOutlined style={{ fontSize: '20px', margin: '0 36px' }} />,
    name: 'dark',
  },
  {
    icon: <AlertOutlined style={{ fontSize: '20px', margin: '0 36px' }} />,
    name: 'auto',
  },
];

// 内置的theme
export const BUILTIN_THEME_PRESETS: BuiltinThemePreset[] = [
  {
    color: '#1890ff',
    type: 'default',
  },
  {
    color: 'rgb(113, 102, 240)',
    type: 'violet',
  },
  {
    color: 'rgb(232, 74, 108)',
    type: 'pink',
  },
  {
    color: 'rgb(239, 189, 72)',
    type: 'yellow',
  },
  {
    color: 'rgb(78, 105, 253)',
    type: 'sky-blue',
  },
  {
    color: '#5ea500',
    type: 'green',
  },
  {
    color: 'rgb(63, 63, 70)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'zinc',
  },

  {
    color: 'rgb(13, 148, 150)',
    type: 'deep-green',
  },

  {
    color: 'rgb(9, 96, 190)',
    type: 'deep-blue',
  },
  {
    color: '#f54a00',
    type: 'orange',
  },
  {
    color: 'rgb(187, 27, 27)',
    type: 'rose',
  },

  {
    color: 'rgb(64, 64, 64)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'neutral',
  },
  {
    color: 'rgb(52, 66, 86)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'slate',
  },
  {
    color: 'rgb(56, 66, 82)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'gray',
  },
  {
    color: '',
    type: 'custom',
  },
];
