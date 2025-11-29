import { useHotkeys } from 'react-hotkeys-hook';

type PlatformHotkeyOptions = {
  mac: string;
  windows: string;
  handler: (event: KeyboardEvent) => void;
  enabled?: boolean; // 添加 enabled 选项
};

/**
 * 使用平台相关的快捷键
 * @param mac MacOS 快捷键
 * @param windows Windows 快捷键
 * @param handler 快捷键触发时的处理函数
 * @param enabled 是否启用快捷键，默认为 true
 * @returns 返回当前使用的快捷键
 */
export const usePlatformHotkey = ({ mac, windows, handler, enabled = true }: PlatformHotkeyOptions) => {
  const isMacOS = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const hotkey = isMacOS ? mac : windows;

  // 使用 enabled 选项控制快捷键是否启用
  useHotkeys(hotkey, handler, { enabled });

  return hotkey;
};
