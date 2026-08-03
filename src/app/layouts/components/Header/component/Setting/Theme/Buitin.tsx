import { UserAddOutlined } from '@ant-design/icons';
import { ColorPicker } from 'antd';
import type { Color } from 'antd/es/color-picker';
import clsx from 'clsx';
import { BUILTIN_THEME_PRESETS } from '@/shared/constants/constants';
import './theme.css';
import { useShallow } from 'zustand/shallow';
import { usePreferencesStore } from '@/shared/stores/preferences.store';

/**
 * 内置主题
 * @returns
 */
const Buitin: React.FC = () => {
  // 属性变动
  const { colorPrimary, updatePreferences } = usePreferencesStore(
    useShallow((state) => ({
      colorPrimary: state.preferences.theme.colorPrimary,
      updatePreferences: state.updatePreferences,
    }))
  );

  // 颜色选择器颜色切换
  const onColorChange = (color: Color) => {
    updatePreferences('theme', 'colorPrimary', color.toCssString());
  };

  return (
    <div className="flex w-full flex-wrap justify-between">
      {BUILTIN_THEME_PRESETS.map((item) => {
        if (item.type === 'custom') {
          return (
            <div key={item.color} className="flex flex-col">
              <div
                className={clsx('outline-box flex items-center justify-center cursor-pointer', {
                  'outline-box-active': colorPrimary === item.color,
                })}
              >
                <div className="w-5 h-5 my-2 mx-10 rounded-md">
                  <div className="flex items-center justify-center relative w-4 h-4 rounded-md">
                    <ColorPicker onChangeComplete={onColorChange} value={colorPrimary}>
                      <UserAddOutlined style={{ fontSize: '1.25rem' }} />
                    </ColorPicker>
                  </div>
                </div>
              </div>
              <div className="text-center text-xs leading-4 text-gray-500 m-1">{item.type}</div>
            </div>
          );
        }

        return (
          <button
            type="button"
            key={item.color}
            className="flex flex-col cursor-pointer border-0 bg-transparent p-0"
            onClick={() => {
              updatePreferences('theme', 'colorPrimary', item.color);
            }}
          >
            <div
              className={clsx('outline-box flex items-center justify-center cursor-pointer', {
                'outline-box-active': colorPrimary === item.color,
              })}
            >
              <div className="bg-color w-5 h-5 my-2 mx-10 rounded-md" style={{ backgroundColor: item.color }} />
            </div>
            <div className="text-center text-xs leading-4 text-gray-500 m-1">{item.type}</div>
          </button>
        );
      })}
    </div>
  );
};
export default Buitin;
