import { ConfigProvider, App as AntdApp } from 'antd';
import type React from 'react';
import App from './App';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import dayjs from 'dayjs';
import { usePreferencesStore } from './stores/store';
import { useShallow } from 'zustand/shallow';
/**
 * 全局配置组件（为了将antd的ConfigProvider和App嵌套，不然App中的antdUtil中的组件无法使用全局配置）
 */
const GlobalConfigProvider: React.FC = () => {
  // 只订阅需要的状态，避免不必要的重渲染,useShallow用在订阅返回对象上的，避免返回对象的引用变化导致重渲染
  const { colorPrimary, locale } = usePreferencesStore(
    useShallow((state) => ({
      colorPrimary: state.preferences.theme.colorPrimary,
      locale: state.preferences.app.locale,
    })),
  );

  dayjs.locale(locale === 'zh-CN' ? 'zh-cn' : 'en');
  return (
    <ConfigProvider
      theme={{
        cssVar: true,
        token: {
          colorPrimary: colorPrimary,
          controlHeight: 36,
          borderRadius: 8
        },
        components: {
          Layout: {
            headerPadding: '0 16px 0 0',
            headerHeight: '50px',
            headerBg: '#fff',
          },
          Tree: {
            directoryNodeSelectedBg: '#e6f4ff',
            indentSize: 12,
            directoryNodeSelectedColor: 'rgba(0, 0, 0, 0.88)',
          },
          Menu: {
            itemColor: '#29343D',
          },
        },
      }}
      locale={locale === 'zh-CN' ? zhCN : enUS}
    >
      <AntdApp style={{ height: '100%' }}>
        <App />
      </AntdApp>
    </ConfigProvider>
  );
};

export default GlobalConfigProvider;
