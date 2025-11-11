import type { MenuModel } from '@/services/system/menu/type';
import { Layout, theme } from 'antd';
import type React from 'react';
import { useCallback, useState } from 'react';
import ButtonDetail from './ButtonDetail';
import ButtonInterfacePermission from './ButtonInterfacePermission';
import ButtonTree from './ButtonTree';
import './permissionButton.scss';

/**
 * 按钮列表主组件
 * 提供权限按钮的树形展示和详情查看功能
 */
const PermissionButton: React.FC = () => {
  const { token } = theme.useToken();
  const [selectedButton, setSelectedButton] = useState<MenuModel | null>(null);

  /**
   * 处理按钮选择
   * @param button 选中的按钮
   */
  const handleSelectButton = useCallback((button: MenuModel | null) => {
    setSelectedButton(button);
  }, []);

  return (
    <Layout>
      <Layout.Sider width={320} theme="light" style={{ borderRadius: token.borderRadius }}>
        {/* 左侧按钮树 */}
        <ButtonTree onSelectButton={handleSelectButton} selectedButtonId={selectedButton ? selectedButton.id : ''} />
      </Layout.Sider>
      <Layout.Content className="flex flex-col ml-2 gap-2">
        {/* 按钮详情 */}
        <ButtonDetail button={selectedButton} />
        {/* 按钮接口权限列表 */}
        <ButtonInterfacePermission button={selectedButton} />
      </Layout.Content>
    </Layout>
  );
};

export default PermissionButton;
