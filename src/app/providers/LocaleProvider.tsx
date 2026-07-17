import { ConfigProvider } from 'antd';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import { type PropsWithChildren, useEffect } from 'react';
import { changeLanguage } from '@/app/bootstrap/i18n';
import { usePreferencesStore } from '@/shared/stores/preferences.store';

/**
 * 国际化 Provider
 *
 * 读取全局偏好（usePreferencesStore）中的语言设置，
 * 同步驱动 i18next、antd locale 与 dayjs。
 */
export function LocaleProvider({ children }: PropsWithChildren) {
  const locale = usePreferencesStore((state) => state.preferences.app.locale);
  const isZhCN = locale === 'zh-CN';

  useEffect(() => {
    dayjs.locale(isZhCN ? 'zh-cn' : 'en');
    void changeLanguage(locale);
  }, [isZhCN, locale]);

  return <ConfigProvider locale={isZhCN ? zhCN : enUS}>{children}</ConfigProvider>;
}
