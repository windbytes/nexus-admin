import type { BasicOptions } from '@/types/global';
import { Select } from 'antd';
import "./switchItem.scss";
import classNames from '@/utils/classnames';
import { getPreferenceValue, usePreferencesStore, type Category, type SettingKey } from '@/stores/store';
import type { Preferences } from '@/stores/storeState';
import { useShallow } from 'zustand/shallow';
import { changeLanguage } from '@/locales/i18next-config';

/**
 * 选择项
 * @returns
 */
const SelectItem: React.FC<SelectItemProps> = (props) => {
  const { title, disabled, placeholder, items, category, pKey } = props;

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
   * 选择时更新状态
   * @param value
   */
  const changePreferences = (value: string) => {
    updatePreferences(category, pKey, value);
    if (pKey === 'locale') {
      changeLanguage(value);
    }
  };

  return (
    <div
      className={classNames('select-item', {
        'pointer-events-none opacity-50': disabled,
      })}
    >
      <span className='flex items-center text-sm leading-5'>
        {title}
      </span>
      {/* Select组件 */}
      <Select options={items} disabled={disabled} placeholder={placeholder} className='w-[165px]' value={value} onChange={changePreferences}/>
    </div>
  );
};
export default SelectItem;

export interface SelectItemProps {
  category: Category;
  pKey: SettingKey<keyof Preferences[Category]>;
  title?: string;
  disabled?: boolean;
  placeholder?: string;
  items?: BasicOptions[];
}
