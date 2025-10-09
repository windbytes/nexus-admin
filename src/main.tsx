import { createRoot } from 'react-dom/client';
import '@/styles/global.scss'; // 引入 Sass 文件
import { BrowserRouter } from 'react-router';
import GlobalConfigProvider from './GlobalConfigProvider';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@ant-design/v5-patch-for-react-19';
import { initI18n } from './locales/i18next-config';

const container = document.getElementById('root');
if (container) {
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
  initI18n().then(() => {
    const root = createRoot(container);
    root.render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <GlobalConfigProvider />
        </QueryClientProvider>
      </BrowserRouter>,
    );
  });
} else {
  console.error('Root element not found');
}
