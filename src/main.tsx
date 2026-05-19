import '@/styles/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, theme as antdTheme, ConfigProvider } from 'antd';
import 'antd/dist/antd.css';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useShallow } from 'zustand/shallow';
import { useResolvedThemeMode } from '@/hooks/useResolvedThemeMode';
import App from './App';
import './index.css';
import { initI18n } from './locales/i18next-config';
import { usePreferencesStore } from './stores/store';

const lightComponents = {
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

const darkComponents = {
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

/**
 * 全局配置提供者组件
 * 提供 Antd 主题和国际化配置
 */
const GlobalProvider: React.FC = () => {
  const { colorPrimary, colorError, colorSuccess, colorWarning, locale, radius, themeMode, compact } =
    usePreferencesStore(
      useShallow((state) => ({
        colorPrimary: state.preferences.theme.colorPrimary,
        colorError: state.preferences.theme.colorError,
        colorSuccess: state.preferences.theme.colorSuccess,
        colorWarning: state.preferences.theme.colorWarning,
        locale: state.preferences.app.locale,
        radius: state.preferences.theme.radius,
        themeMode: state.preferences.theme.mode,
        compact: state.preferences.app.compact,
      }))
    );

  const resolvedColorMode = useResolvedThemeMode(themeMode);
  const isDark = resolvedColorMode === 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  const algorithm = useMemo(() => {
    const base = isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;
    return compact ? [base, antdTheme.compactAlgorithm] : base;
  }, [isDark, compact]);

  const mergedTheme = useMemo(
    () => ({
      hashed: false,
      // 配置使用零运行时，因此需要手动引入 antd/dist/antd.css，详情参考 {@link https://ant.design/docs/react/customize-theme-cn#zero-runtime}
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
    }),
    [algorithm, colorPrimary, colorError, colorSuccess, colorWarning, radius, isDark]
  );

  // 设置 dayjs 的语言
  dayjs.locale(locale === 'zh-CN' ? 'zh-cn' : 'en');

  return (
    <ConfigProvider theme={mergedTheme} locale={locale === 'zh-CN' ? zhCN : enUS}>
      <AntdApp className="h-full">
        <App />
      </AntdApp>
    </ConfigProvider>
  );
};

const container = document.getElementById('root');

if (container) {
  // 创建 QueryClient 实例
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false, // 窗口聚焦时不重新获取数据
        refetchOnReconnect: true, // 网络重连时重新获取数据
        gcTime: 1000 * 60 * 60 * 3, // 3小时后自动垃圾回收
        networkMode: 'online', // 只在在线时执行查询
      },
      mutations: {
        networkMode: 'online',
      },
    },
  });

  // 初始化国际化
  initI18n().then(() => {
    const root = createRoot(container);
    root.render(
      <QueryClientProvider client={queryClient}>
        <GlobalProvider />
      </QueryClientProvider>
    );
  });
} else {
  console.error('Root element not found');
}
