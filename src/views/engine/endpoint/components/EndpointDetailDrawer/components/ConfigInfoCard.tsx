import { Card, Typography } from 'antd';
import type React from 'react';
import type { Endpoint } from '@/services/engine/endpoint/types';

const { Paragraph, Text } = Typography;

interface ConfigInfoCardProps {
  endpoint: Endpoint;
}

/**
 * 配置信息卡片组件
 */
const ConfigInfoCard: React.FC<ConfigInfoCardProps> = ({ endpoint }) => {
  /**
   * 渲染配置信息
   */
  const renderConfigInfo = () => {
    if (!endpoint.config) {
      return <Text type="secondary">暂无配置信息</Text>;
    }

    return (
      <Paragraph>
        <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(endpoint.config, null, 2)}
        </pre>
      </Paragraph>
    );
  };

  return (
    <Card title="配置信息" size="small">
      {renderConfigInfo()}
    </Card>
  );
};

ConfigInfoCard.displayName = 'ConfigInfoCard';

export default ConfigInfoCard;
