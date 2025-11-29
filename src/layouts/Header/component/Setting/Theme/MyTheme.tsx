import { THEME_PRESET } from "@/enums/constants";
import { usePreferencesStore } from "@/stores/store";
import "./theme.scss";
import SwitchItem from "../SwitchItem";
import { useShallow } from "zustand/shallow";
import clsx from "clsx";

/**
 * 主题
 * @returns
 */
const MyTheme: React.FC = () => {
  const { mode, updatePreferences } = usePreferencesStore(
    useShallow((state) => ({
      mode: state.preferences.theme.mode,
      updatePreferences: state.updatePreferences,
    }))
  );
  return (
    <div
      className="flex w-full flex-wrap justify-between"
    >
      {THEME_PRESET.map((item) => {
        return (
          <div
            key={item.name}
            className="flex items-center justify-center h-full"
          >
            <div
              className="flex flex-col cursor-pointer"
              onClick={() => {
                updatePreferences("theme", "mode", item.name);
              }}
            >
              <div
                className={clsx("outline-box pt-4! pb-4!", {
                  "outline-box-active": item.name === mode,
                })}
              >
                {item.icon}
              </div>
              <div
                className="text-center text-xs leading-4 text-gray-500 mt-2"
              >
                {item.name}
              </div>
            </div>
          </div>
        );
      })}
      {/* 深色侧边栏 */}
      <SwitchItem
        className="mt-6"
        title="深色侧边栏"
        category="theme"
        disabled={false}
        pKey="semiDarkSidebar"
      />
      {/* 深色顶栏 */}
      <SwitchItem
        disabled
        title="深色顶栏"
        category="theme"
        pKey="semiDarkHeader"
      />
    </div>
  );
};
export default MyTheme;
