import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { memo } from 'react';
import { usePreferencesStore } from '@/stores/store';

const CollapseSwitch: React.FC = () => {
  // 从全局状态中获取配置是否开启面包屑、图标
  const collapsed = usePreferencesStore((state) => state.preferences.sidebar.collapsed);
  // 从全局状态中更新配置是否开启面包屑、图标
  const updatePreferences = usePreferencesStore((state) => state.updatePreferences);
  return (
    <Button
      type="text"
      classNames={{
        root: 'p-0!',
      }}
      icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      onClick={() => updatePreferences('sidebar', 'collapsed', !collapsed)}
    />
  );
};

export default memo(CollapseSwitch);
