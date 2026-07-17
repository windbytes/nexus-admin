import { Dropdown, type MenuProps } from 'antd';
import { changeLanguage } from '@/app/bootstrap/i18n';
import { languages } from '@/locales/language';
import { MyIcon } from '@/shared/components/common/MyIcon';
import { usePreferencesStore } from '@/shared/stores/preferences.store';

/**
 * 语言切换
 * @returns
 */
const LanguageSwitch = () => {
  const updatePreferences = usePreferencesStore((state) => state.updatePreferences);
  /**
   * 下拉语言选项
   */
  const menuItems: MenuProps['items'] = languages.map((item) => ({
    key: item.value,
    label: item.name,
    onClick: () => changeLocale(item.value),
  }));

  /**
   * 切换语言
   * @param locale 语言
   */
  const changeLocale = (locale: string) => {
    updatePreferences('app', 'locale', locale);
    changeLanguage(locale);
  };
  return (
    <Dropdown menu={{ items: menuItems }} placement="bottom">
      <MyIcon type="syndra-language" className="text-[18px] cursor-pointer" />
    </Dropdown>
  );
};

export default LanguageSwitch;
