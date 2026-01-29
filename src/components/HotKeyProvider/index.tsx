import type { ReactNode } from 'react';
import { useShallow } from 'zustand/shallow';
import { useLogout } from '@/hooks/useLogout';
import { usePlatformHotkey } from '@/hooks/usePlatformHotkey';
import useGlobalUIStore from '@/stores/globalUIStore';
import { usePreferencesStore } from '@/stores/store';

/**
 * 快捷键提供者
 * @param children 子组件
 * @returns 子组件
 */
const HotKeyProvider: React.FC<{ children: ReactNode }> = ({ children }: { children: ReactNode }) => {
  const { setSearchMenuModalOpen, setSettingMenuModalOpen } = useGlobalUIStore(
    useShallow((state) => ({
      setSearchMenuModalOpen: state.setSearchMenuModalOpen,
      setSettingMenuModalOpen: state.setSettingMenuModalOpen,
    }))
  );

  const { globalLogout, globalLockScreen, globalPreferences, enable, updatePreferences } = usePreferencesStore(
    useShallow((state) => ({
      globalLogout: state.preferences.shortcut.globalLogout,
      globalLockScreen: state.preferences.shortcut.globalLockScreen,
      globalPreferences: state.preferences.shortcut.globalPreferences,
      enable: state.preferences.shortcut.enable,
      updatePreferences: state.updatePreferences,
    }))
  );

  const handleLogout = useLogout();

  // 始终注册全局快捷键（搜索），通过 enabled 控制是否启用
  usePlatformHotkey({
    mac: 'meta+k',
    windows: 'ctrl+k',
    handler: (event) => {
      event.preventDefault();
      event.stopPropagation();
      setSearchMenuModalOpen(true);
    },
    enabled: enable, // 通过 enabled 控制
  });

  // 始终注册全局快捷键（偏好设置），通过 enabled 控制是否启用
  usePlatformHotkey({
    mac: 'alt+,',
    windows: 'ctrl+alt+s',
    handler: (event) => {
      event.preventDefault();
      event.stopPropagation();
      setSettingMenuModalOpen(true);
    },
    enabled: enable && globalPreferences,
  });

  // 始终注册全局快捷键（退出登录），通过 enabled 控制是否启用
  usePlatformHotkey({
    mac: 'alt+q',
    windows: 'alt+q',
    handler: (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleLogout();
    },
    enabled: enable && globalLogout, // 通过 enabled 控制
  });

  // 快捷键锁屏
  usePlatformHotkey({
    mac: 'alt+l',
    windows: 'alt+l',
    handler: (event) => {
      event.preventDefault();
      event.stopPropagation();
      updatePreferences('widget', 'lockScreenStatus', true);
    },
    enabled: enable && globalLockScreen,
  });

  // 直接返回 children 即可
  return children;
};

export default HotKeyProvider;
