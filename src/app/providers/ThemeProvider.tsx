import { ConfigProvider } from 'antd';
import { type PropsWithChildren, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { applyDocumentTheme, createAntdTheme } from '@/app/bootstrap/theme';
import { useResolvedThemeMode } from '@/shared/hooks/useResolvedThemeMode';
import { usePreferencesStore } from '@/shared/stores/preferences.store';

/**
 * 主题 Provider
 *
 * 读取全局偏好（usePreferencesStore）中的主题配置，
 * 驱动 antd ConfigProvider 与 document 的明暗主题属性。
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const { colorPrimary, colorError, colorSuccess, colorWarning, radius, themeMode, compact } = usePreferencesStore(
    useShallow((state) => ({
      colorPrimary: state.preferences.theme.colorPrimary,
      colorError: state.preferences.theme.colorError,
      colorSuccess: state.preferences.theme.colorSuccess,
      colorWarning: state.preferences.theme.colorWarning,
      radius: state.preferences.theme.radius,
      themeMode: state.preferences.theme.mode,
      compact: state.preferences.app.compact,
    }))
  );

  const isDark = useResolvedThemeMode(themeMode) === 'dark';

  useEffect(() => {
    applyDocumentTheme(isDark);
  }, [isDark]);

  const theme = createAntdTheme({
    isDark,
    compact,
    colorPrimary,
    colorError,
    colorSuccess,
    colorWarning,
    radius,
  });

  return <ConfigProvider theme={theme}>{children}</ConfigProvider>;
}
