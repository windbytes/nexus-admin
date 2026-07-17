import { theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider/context';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeOptions {
  isDark: boolean;
  compact: boolean;
  colorPrimary: string;
  colorError: string;
  colorSuccess: string;
  colorWarning: string;
  radius: number;
}

export const lightComponents = {
  Layout: {
    headerPadding: '0',
    headerHeight: 'auto',
    bodyBg: '#f2f3f5',
  },
  Tree: {
    directoryNodeSelectedBg: '#e6f4ff',
    indentSize: 12,
    directoryNodeSelectedColor: 'rgba(0, 0, 0, 0.88)',
  },
  Card: {
    colorBorder: '#e4e7ed',
  },
} as const;

export const darkComponents = {
  Layout: {
    headerPadding: '0',
    headerHeight: 'auto',
  },
  Tree: {
    directoryNodeSelectedBg: 'rgba(255, 255, 255, 0.12)',
    indentSize: 12,
    directoryNodeSelectedColor: 'rgba(255, 255, 255, 0.85)',
  },
  Card: {},
} as const;

export function createAntdTheme(options: ThemeOptions): ThemeConfig {
  const { isDark, compact, colorPrimary, colorError, colorSuccess, colorWarning, radius } = options;
  const base = isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;
  const algorithm = compact ? [base, antdTheme.compactAlgorithm] : base;

  return {
    // Source: https://ant.design/docs/react/customize-theme#zero-runtime
    hashed: false,
    zeroRuntime: true,
    algorithm,
    token: {
      colorPrimary,
      colorError,
      colorSuccess,
      colorWarning,
      borderRadius: radius,
    },
    components: isDark ? darkComponents : lightComponents,
  };
}

export function applyDocumentTheme(isDark: boolean) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

export function getResolvedThemeMode(mode: ThemeMode) {
  if (mode !== 'auto') {
    return mode;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
