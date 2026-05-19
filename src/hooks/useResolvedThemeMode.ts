import { useSyncExternalStore } from 'react';
import type { ThemeModeType } from '@/types/app';

function subscribePreferredDark(callback: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getPreferredDarkSnapshot() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getServerSnapshot() {
  return false;
}

const noopSubscribe = () => () => {
  /* no subscription when theme mode is not "auto" */
};

/**
 * 将偏好里的 light | dark | auto 解析为实际用于 Ant Design 与布局的 light | dark。
 */
export function useResolvedThemeMode(mode: ThemeModeType): 'light' | 'dark' {
  const systemDark = useSyncExternalStore(
    mode === 'auto' ? subscribePreferredDark : noopSubscribe,
    mode === 'auto' ? getPreferredDarkSnapshot : () => false,
    getServerSnapshot
  );
  if (mode === 'auto') {
    return systemDark ? 'dark' : 'light';
  }
  return mode;
}
