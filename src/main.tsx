import '@/styles/global.scss';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import 'antd/dist/antd.css';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import { createRoot } from 'react-dom/client';
import { useShallow } from 'zustand/shallow';
import App from './App';
import './index.css';
import { initI18n } from './locales/i18next-config';
import { usePreferencesStore } from './stores/store';

/**
 * 全局配置提供者组件
 * 提供 Antd 主题和国际化配置
 */
const GlobalProvider: React.FC = () => {
  // 只订阅需要的状态，避免不必要的重渲染
  const { colorPrimary, locale } = usePreferencesStore(
    useShallow((state) => ({
      colorPrimary: state.preferences.theme.colorPrimary,
      locale: state.preferences.app.locale,
    }))
  );

  // 设置 dayjs 的语言
  dayjs.locale(locale === 'zh-CN' ? 'zh-cn' : 'en');

  return (
    <ConfigProvider
      theme={{
        hashed: false,
        zeroRuntime: true,
        token: {
          colorPrimary: colorPrimary,
        },
        components: {
          Layout: {
            headerPadding: '0',
            headerHeight: 'auto',
          },
          Tree: {
            directoryNodeSelectedBg: '#e6f4ff',
            indentSize: 12,
            directoryNodeSelectedColor: 'rgba(0, 0, 0, 0.88)',
          },
        },
      }}
      locale={locale === 'zh-CN' ? zhCN : enUS}
    >
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
        gcTime: 1000 * 60 * 60 * 12, // 12小时后自动垃圾回收
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
