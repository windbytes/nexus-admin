import { Card, Tabs } from 'antd';
import type React from 'react';
import { useState } from 'react';
import BatchPermissionOperation from './BatchPermissionOperation';
import PermissionPreview from './components/PermissionPreview';
import RolePermissionAssign from './components/RolePermissionAssign';
import './permissionAssign.scss';

/**
 * 权限分配管理主组件
 * 提供角色权限分配、权限预览和批量操作功能
 */
const PermissionAssign: React.FC = () => {
  const [activeTab, setActiveTab] = useState('role-assign');

  /**
   * 处理Tab切换
   * @param key 选中的Tab key
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <Card className="h-full" classNames={{ body: 'p-4! h-full' }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'role-assign',
              label: '角色权限分配',
              className: 'h-full pt-4',
              children: <RolePermissionAssign />,
            },
            {
              key: 'permission-preview',
              label: '权限预览',
              className: 'h-full pt-4',
              children: <PermissionPreview />,
            },
            {
              key: 'batch-operation',
              label: '批量操作',
              className: 'h-full pt-4',
              children: <BatchPermissionOperation />,
            },
          ]}
          className="h-full permission-assign-tabs"
          tabBarStyle={{ marginBottom: 0, padding: '0 24px' }}
        />
      </Card>
    </div>
  );
};

export default PermissionAssign;
