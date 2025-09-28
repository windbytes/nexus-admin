import { Card, Tabs, Badge } from 'antd';
import { useMemo, memo } from 'react';
import type React from 'react';
import type { MenuModel } from '@/services/system/menu/type';
import MenuPermissionTable from './MenuPermissionTable';
import ButtonPermissionTable from './ButtonPermissionTable';
import InterfacePermissionTable from './InterfacePermissionTable';

/**
 * 详细权限标签页组件Props
 */
interface DetailPermissionTabsProps {
  /** 菜单权限数据 */
  menuDetails?: MenuModel[];
  /** 菜单权限加载状态 */
  menuDetailsLoading?: boolean;
  /** 按钮权限数据 */
  buttonDetails?: MenuModel[];
  /** 按钮权限加载状态 */
  buttonDetailsLoading?: boolean;
  /** 菜单权限数量 */
  menuCount?: number;
  /** 按钮权限数量 */
  buttonCount?: number;
  /** 接口权限数量 */
  interfaceCount?: number;
}

/**
 * 详细权限标签页组件
 * 负责展示详细的权限列表
 */
const DetailPermissionTabs: React.FC<DetailPermissionTabsProps> = memo(({
  menuDetails = [],
  menuDetailsLoading = false,
  buttonDetails = [],
  buttonDetailsLoading = false,
  menuCount = 0,
  buttonCount = 0,
  interfaceCount = 0,
}) => {
  /**
   * Tabs配置
   */
  const tabItems = useMemo(() => [
    {
      key: 'menu',
      label: (
        <Badge count={menuCount} size="small">
          <span>菜单权限</span>
        </Badge>
      ),
      children: (
        <MenuPermissionTable
          dataSource={menuDetails}
          loading={menuDetailsLoading}
        />
      ),
    },
    {
      key: 'button',
      label: (
        <Badge count={buttonCount} size="small">
          <span>按钮权限</span>
        </Badge>
      ),
      children: (
        <ButtonPermissionTable
          dataSource={buttonDetails}
          loading={buttonDetailsLoading}
        />
      ),
    },
    {
      key: 'interface',
      label: (
        <Badge count={interfaceCount} size="small">
          <span>接口权限</span>
        </Badge>
      ),
      children: (
        <InterfacePermissionTable
          dataSource={[]} // 接口权限数据待实现
          loading={false}
        />
      ),
    },
  ], [menuDetails, menuDetailsLoading, buttonDetails, buttonDetailsLoading, menuCount, buttonCount, interfaceCount]);

  return (
    <Card title="详细权限" size="small" className="h-full">
      <Tabs
        items={tabItems}
        className="h-full"
      />
    </Card>
  );
});

DetailPermissionTabs.displayName = 'DetailPermissionTabs';

export default DetailPermissionTabs;
