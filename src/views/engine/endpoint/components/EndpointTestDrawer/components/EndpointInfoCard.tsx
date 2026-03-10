import { Card, Descriptions, Tag } from 'antd';
import type React from 'react';
import type { EndpointModel } from '@/services/integrated/endpoint/endpointApi';

interface EndpointInfoCardProps {
  endpoint: EndpointModel;
}

/**
 * 端点信息卡片组件
 */
const EndpointInfoCard: React.FC<EndpointInfoCardProps> = ({ endpoint }) => {
  return (
    <Card title="端点信息" size="small">
      <Descriptions column={1} size="small">
        <Descriptions.Item label="名称">{endpoint.name}</Descriptions.Item>
        <Descriptions.Item label="类型">{endpoint.endpointType}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={endpoint.status ? 'green' : 'red'}>{endpoint.status ? '启用' : '禁用'}</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

EndpointInfoCard.displayName = 'EndpointInfoCard';

export default EndpointInfoCard;
