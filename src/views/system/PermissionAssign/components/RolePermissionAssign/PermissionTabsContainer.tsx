import { Card, Tabs, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useCallback, useMemo, memo } from 'react';
import type React from 'react';
import MenuPermissionTree from './MenuPermissionTree';
import ButtonPermissionTree from './ButtonPermissionTree';
import InterfacePermissionGrid from './InterfacePermissionGrid';

/**
 * 权限分配Tabs容器组件Props
 */
interface PermissionTabsContainerProps {
  /** 当前角色Code */
  currentRoleCode: string | null;
  /** 活跃的tab */
  activeTab: 'menu' | 'button' | 'interface';
  /** Tab切换回调 */
  onTabChange: (key: string) => void;
  /** 菜单权限选中keys */
  menuCheckedKeys: string[];
  /** 按钮权限选中keys */
  buttonCheckedKeys: string[];
  /** 接口权限选中keys */
  interfaceCheckedKeys: string[];
  /** 菜单权限变化回调 */
  onMenuPermissionChange: (keys: string[]) => void;
  /** 按钮权限变化回调 */
  onButtonPermissionChange: (keys: string[]) => void;
  /** 接口权限变化回调 */
  onInterfacePermissionChange: (keys: string[]) => void;
  /** 是否正在加载权限数据 */
  isLoading?: boolean;
}

/**
 * 权限分配Tabs容器组件
 * 专门负责Tabs切换和权限内容渲染
 */
const PermissionTabsContainer: React.FC<PermissionTabsContainerProps> = memo(({
  currentRoleCode,
  activeTab,
  onTabChange,
  menuCheckedKeys,
  buttonCheckedKeys,
  interfaceCheckedKeys,
  onMenuPermissionChange,
  onButtonPermissionChange,
  onInterfacePermissionChange,
  isLoading = false,
}) => {

  /**
   * 渲染权限内容 - 使用useCallback优化
   * @param permissionComponent 权限组件
   */
  const renderPermissionContent = useCallback((permissionComponent: React.ReactNode) => {
    if (!currentRoleCode) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <UserOutlined className="text-4xl mb-4" />
            <p>请先选择角色</p>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div className="h-full overflow-hidden">
        {permissionComponent}
      </div>
    );
  }, [currentRoleCode, isLoading]);

  /**
   * Tabs组件的items配置 - 使用useMemo优化
   */
  const tabItems = useMemo(() => [
    {
      key: 'menu',
      label: '菜单权限',
      children: renderPermissionContent(
        <MenuPermissionTree checkedKeys={menuCheckedKeys} onCheck={onMenuPermissionChange} />
      ),
    },
    {
      key: 'button',
      label: '按钮权限',
      children: renderPermissionContent(
        <ButtonPermissionTree checkedKeys={buttonCheckedKeys} onCheck={onButtonPermissionChange} />
      ),
    },
    {
      key: 'interface',
      label: '接口权限',
      children: renderPermissionContent(
        <InterfacePermissionGrid checkedKeys={interfaceCheckedKeys} onCheck={onInterfacePermissionChange} />
      ),
    },
  ], [renderPermissionContent, menuCheckedKeys, buttonCheckedKeys, interfaceCheckedKeys, onMenuPermissionChange, onButtonPermissionChange, onInterfacePermissionChange]);

  return (
    <div className="flex-1 h-0 overflow-hidden">
      <Card
        title={`${activeTab === 'menu' ? '菜单' : activeTab === 'button' ? '按钮' : '接口'}权限分配`}
        className="h-full flex flex-col"
        styles={{ 
          body: { 
            flex: 1, 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          } 
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={tabItems}
          style={{ height: '100%' }}
          tabBarStyle={{ marginBottom: 0 }}
        />
      </Card>
    </div>
  );
});
export default PermissionTabsContainer;
