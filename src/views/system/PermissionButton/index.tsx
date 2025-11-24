import type { MenuModel } from '@/services/system/menu/type';
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
  const [selectedButton, setSelectedButton] = useState<MenuModel | null>(null);

  /**
   * 处理按钮选择
   * @param button 选中的按钮
   */
  const handleSelectButton = useCallback((button: MenuModel | null) => {
    setSelectedButton(button);
  }, []);

  return (
    <div className="flex gap-2 h-full w-full">
        {/* 左侧按钮树 */}
      <ButtonTree onSelectButton={handleSelectButton} selectedButtonId={selectedButton ? selectedButton.id : ''} />
      <div className="flex flex-col flex-1 gap-2 h-full min-w-0">
        {/* 按钮详情 */}
        <ButtonDetail button={selectedButton} />
        {/* 按钮接口权限列表 */}
        <ButtonInterfacePermission button={selectedButton} />
      </div>
    </div>
  );
};

export default PermissionButton;
