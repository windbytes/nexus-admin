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
 * 菜单权限组件包装 - 独立memo，避免其他权限变化时重渲染
 */
const MenuPermissionTreeWrapper = memo<{
  checkedKeys: string[];
  onCheck: (keys: string[]) => void;
}>(({ checkedKeys, onCheck }) => (
  <MenuPermissionTree checkedKeys={checkedKeys} onCheck={onCheck} />
));

/**
 * 按钮权限组件包装 - 独立memo，避免其他权限变化时重渲染
 */
const ButtonPermissionTreeWrapper = memo<{
  checkedKeys: string[];
  onCheck: (keys: string[]) => void;
}>(({ checkedKeys, onCheck }) => (
  <ButtonPermissionTree checkedKeys={checkedKeys} onCheck={onCheck} />
));

/**
 * 接口权限组件包装 - 独立memo，避免其他权限变化时重渲染
 */
const InterfacePermissionGridWrapper = memo<{
  checkedKeys: string[];
  onCheck: (keys: string[]) => void;
}>(({ checkedKeys, onCheck }) => (
  <InterfacePermissionGrid checkedKeys={checkedKeys} onCheck={onCheck} />
));

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
   * 菜单权限Tab配置 - 独立memo，只依赖菜单相关状态
   */
  const menuTabItem = useMemo(() => ({
    key: 'menu',
    label: '菜单权限',
    children: renderPermissionContent(
      <MenuPermissionTreeWrapper checkedKeys={menuCheckedKeys} onCheck={onMenuPermissionChange} />
    ),
  }), [renderPermissionContent, menuCheckedKeys, onMenuPermissionChange]);

  /**
   * 按钮权限Tab配置 - 独立memo，只依赖按钮相关状态
   */
  const buttonTabItem = useMemo(() => ({
    key: 'button',
    label: '按钮权限',
    children: renderPermissionContent(
      <ButtonPermissionTreeWrapper checkedKeys={buttonCheckedKeys} onCheck={onButtonPermissionChange} />
    ),
  }), [renderPermissionContent, buttonCheckedKeys, onButtonPermissionChange]);

  /**
   * 接口权限Tab配置 - 独立memo，只依赖接口相关状态
   */
  const interfaceTabItem = useMemo(() => ({
    key: 'interface',
    label: '接口权限',
    children: renderPermissionContent(
      <InterfacePermissionGridWrapper checkedKeys={interfaceCheckedKeys} onCheck={onInterfacePermissionChange} />
    ),
  }), [renderPermissionContent, interfaceCheckedKeys, onInterfacePermissionChange]);

  /**
   * Tabs组件的items配置 - 组合所有tab项
   */
  const tabItems = useMemo(() => [
    menuTabItem,
    buttonTabItem,
    interfaceTabItem,
  ], [menuTabItem, buttonTabItem, interfaceTabItem]);

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
