import { Card, Tabs } from 'antd';
import { useState } from 'react';
import type React from 'react';
import UsageStatistics from './UsageStatistics';
import ChangeLog from './ChangeLog';
import AnomalyDetection from './AnomalyDetection';

/**
 * 权限审计主组件
 * 提供权限使用统计、变更日志和异常检测功能
 */
const PermissionAudit: React.FC = () => {
  const [activeTab, setActiveTab] = useState('statistics');

  /**
   * 处理Tab切换
   * @param key 选中的Tab key
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="permission-audit-container h-full">
      <Card className="h-full" styles={{ body: { padding: 0 } }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'statistics',
              label: '使用统计',
              children: <UsageStatistics />,
            },
            {
              key: 'changelog',
              label: '变更日志',
              children: <ChangeLog />,
            },
            {
              key: 'anomaly',
              label: '异常检测',
              children: <AnomalyDetection />,
            },
          ]}
          className="h-full"
          tabBarStyle={{ marginBottom: 0, padding: '0 24px' }}
        />
      </Card>
    </div>
  );
};

export default PermissionAudit;
