import { Switch } from "antd";
import type { ReactNode } from "react";
import {
  type Category,
  type SettingKey,
  usePreferencesStore,
} from "@/stores/store";
import type { Preferences } from "@/stores/storeState";
import "./switchItem.scss";
import { useShallow } from "zustand/shallow";
import classNames from "@/utils/classnames";

/**
 * 获取 preferences 中的值
 * @param preferences - 全局状态库中的 preferences
 * @param category - 类别
 * @param key - 设置键
 * @returns 设置值
 */
const getPreferenceValue = <T extends Category, K extends SettingKey<T>>(
  preferences: Preferences,
  category: T,
  pKey: K
): Preferences[T][K] => {
  return preferences[category][pKey];
};

/**
 * 切换组件
 * @returns SwitchItem
 */
const SwitchItem: React.FC<SwitchItemProps> = (props) => {
  const { title, disabled = true, shortcut, style, category, pKey, className } = props;

  // 从全局状态库中获取配置(这样写表明当前组件只会关注 value 和 updatePreferences 的变化)
  const { value, updatePreferences } = usePreferencesStore(
    useShallow((state) => ({
      value: getPreferenceValue(
        state.preferences,
        category,
        pKey as unknown as SettingKey<Category>
      ),
      updatePreferences: state.updatePreferences,
    }))
  );

  /**
   * 切换时更新状态
   * @param checked
   */
  const changePreferences = (checked: boolean) => {
    updatePreferences(category, pKey, checked);
  };

  return (
    <div className={classNames('switch-item', className)} style={style}>
      <span
        className="flex items-center text-sm leading-5"
      >
        {title}
      </span>
      {shortcut && (
        <span
          className="opacity-60 text-xs leading-4 ml-auto mr-2"
        >
          {shortcut}
        </span>
      )}
      {/* 切换 */}
      <Switch
        disabled={disabled}
        onChange={changePreferences}
        checked={value}
      />
    </div>
  );
};
export default SwitchItem;

export interface SwitchItemProps {
  title?: string;
  disabled?: boolean;
  shortcut?: ReactNode | string;
  children?: ReactNode;
  style?: React.CSSProperties;
  category: Category;
  pKey: SettingKey<keyof Preferences[Category]>;
  className?: string;
}
