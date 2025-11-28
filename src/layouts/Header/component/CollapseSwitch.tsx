import { usePreferencesStore } from "@/stores/store";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { memo } from "react";

const CollapseSwitch: React.FC = () => {
  // 从全局状态中获取配置是否开启面包屑、图标
  const collapsed = usePreferencesStore(
    (state) => state.preferences.sidebar.collapsed
  );
  // 从全局状态中更新配置是否开启面包屑、图标
  const updatePreferences = usePreferencesStore(
    (state) => state.updatePreferences
  );
  return (
    <span
      className="text-[16px] cursor-pointer ml-[6px] inline-flex items-center justify-center"
      onClick={() => updatePreferences("sidebar", "collapsed", !collapsed)}
    >
      {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
    </span>
  );
};

export default memo(CollapseSwitch);
