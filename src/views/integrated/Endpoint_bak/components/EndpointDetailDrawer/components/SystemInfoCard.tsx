import { Card, Descriptions } from 'antd';
import type React from 'react';
import type { EndpointModel } from '@/services/integrated/endpoint/endpointApi';

interface SystemInfoCardProps {
  endpoint: EndpointModel;
}

/**
 * 系统信息卡片组件
 */
const SystemInfoCard: React.FC<SystemInfoCardProps> = ({ endpoint }) => {
  return (
    <Card title="系统信息" size="small">
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="创建时间">
          {endpoint.createTime ? new Date(endpoint.createTime).toLocaleString('zh-CN') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {endpoint.updateTime ? new Date(endpoint.updateTime).toLocaleString('zh-CN') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="创建人">{endpoint.createBy || '-'}</Descriptions.Item>
        <Descriptions.Item label="更新人">{endpoint.updateBy || '-'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

SystemInfoCard.displayName = 'SystemInfoCard';

export default SystemInfoCard;

