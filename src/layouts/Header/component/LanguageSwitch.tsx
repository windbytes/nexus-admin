import { MyIcon } from "@/components/MyIcon";
import { changeLanguage } from "@/locales/i18next-config";
import { languages } from "@/locales/language";
import { usePreferencesStore } from "@/stores/store";
import { Dropdown, type MenuProps } from "antd";
import { memo, useCallback } from "react";

/**
 * 语言切换
 * @returns
 */
const LanguageSwitch = () => {
  const updatePreferences = usePreferencesStore(
    (state) => state.updatePreferences
  );
  /**
   * 下拉语言选项
   */
  const menuItems: MenuProps["items"] = languages.map((item: any) => ({
    key: item.value,
    label: item.name,
    onClick: () => changeLocale(item.value),
  }));

  /**
   * 切换语言
   * @param locale 语言
   */
  const changeLocale = useCallback(
    (locale: string) => {
      updatePreferences("app", "locale", locale);
      changeLanguage(locale);
    },
    [updatePreferences]
  );
  return (
    <Dropdown menu={{ items: menuItems }} placement="bottom">
      <MyIcon
        type="nexus-language"
        className="text-[18px] cursor-pointer"
      />
    </Dropdown>
  );
};

export default memo(LanguageSwitch);
