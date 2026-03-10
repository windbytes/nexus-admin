import { Card, Descriptions, Tag, Typography } from 'antd';
import type React from 'react';
import { ENDPOINT_TYPE_OPTIONS } from '@/services/integrated/endpoint/endpointApi';
import type { EndpointModel } from '@/services/integrated/endpoint/endpointApi';

const { Text } = Typography;

interface BasicInfoCardProps {
  endpoint: EndpointModel;
}

/**
 * 基础信息卡片组件
 */
const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ endpoint }) => {
  /**
   * 获取端点类型名称
   */
  const getEndpointTypeName = (type: string): string => {
    const option = ENDPOINT_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option?.label || type;
  };

  /**
   * 获取端点类型颜色
   */
  const getEndpointTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      http: 'blue',
      database: 'green',
      webservice: 'purple',
      file: 'orange',
      timer: 'cyan',
      mq: 'magenta',
    };
    return colorMap[type] || 'default';
  };

  return (
    <Card title="基础信息" size="small">
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="端点名称" span={2}>
          <Text strong>{endpoint.name}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="端点类型">
          <Tag color={getEndpointTypeColor(endpoint.endpointType)}>{getEndpointTypeName(endpoint.endpointType)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="端点分类">
          {endpoint.category || <Text type="secondary">未分类</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="模式">{endpoint.mode || <Text type="secondary">-</Text>}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={endpoint.status ? 'green' : 'red'}>{endpoint.status ? '启用' : '禁用'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={2}>
          {endpoint.description || <Text type="secondary">无描述</Text>}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

BasicInfoCard.displayName = 'BasicInfoCard';

export default BasicInfoCard;
