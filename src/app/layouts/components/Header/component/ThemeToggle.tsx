import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { useResolvedThemeMode } from '@/shared/hooks/useResolvedThemeMode';
import { usePreferencesStore } from '@/shared/stores/preferences.store';

/**
 * 头部工具栏：在浅色 / 深色之间切换（与设置面板中的「主题」一致）。
 */
const ThemeToggle = () => {
  const { mode, updatePreferences } = usePreferencesStore(
    useShallow((state) => ({
      mode: state.preferences.theme.mode,
      updatePreferences: state.updatePreferences,
    }))
  );
  const resolved = useResolvedThemeMode(mode);
  const { t } = useTranslation();

  const handleToggle = () => {
    const next = resolved === 'light' ? 'dark' : 'light';
    updatePreferences('theme', 'mode', next);
  };

  const isLightResolved = resolved === 'light';
  const label = isLightResolved ? t('layout.header.themeToDark') : t('layout.header.themeToLight');

  return (
    <Tooltip placement="bottom" title={label}>
      <Button
        type="text"
        aria-label={label}
        icon={isLightResolved ? <MoonOutlined /> : <SunOutlined />}
        onClick={handleToggle}
        className="text-[18px]! flex h-8 w-8 items-center justify-center p-0!"
      />
    </Tooltip>
  );
};

export default ThemeToggle;
