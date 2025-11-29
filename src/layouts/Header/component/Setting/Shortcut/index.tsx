import SwitchItem from '../SwitchItem';
import { getShortcutLabel } from '@/utils/utils';

/**
 * 快捷键
 * @returns
 */
const Shortcut: React.FC = () => {
  return (
    <>
      <SwitchItem title="快捷键" category="shortcut" pKey="enable" />
      {/* 全局搜索 */}
      <SwitchItem
        title="全局搜索"
        shortcut={getShortcutLabel("Ctrl K")}
        category="shortcut"
        pKey="globalSearch"
      />
      {/* 偏好设置 */}
      <SwitchItem
        title="偏好设置"
        shortcut={getShortcutLabel("Ctrl ,")}
        category="shortcut"
        pKey="globalPreferences"
      />
      {/* 退出登录 */}
      <SwitchItem
        title="退出登录"
        shortcut={getShortcutLabel("Alt Q")}
        category="shortcut"
        pKey="globalLogout"
      />
      {/* 锁定屏幕 */}
      <SwitchItem
        title="锁定屏幕"
        shortcut={getShortcutLabel("Alt L")}
        category="shortcut"
        pKey="globalLockScreen"
      />
    </>
  );
};
export default Shortcut;
