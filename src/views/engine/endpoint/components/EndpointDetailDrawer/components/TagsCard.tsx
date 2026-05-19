import { Card, Space, Tag, Typography } from 'antd';
import type React from 'react';
import type { Endpoint } from '@/services/engine/endpoint/types';

const { Text } = Typography;

interface TagsCardProps {
  endpoint: Endpoint;
}

/**
 * 标签卡片组件
 */
const TagsCard: React.FC<TagsCardProps> = ({ endpoint }) => {
  /**
   * 渲染标签
   */
  const renderTags = () => {
    if (!endpoint.tags || endpoint.tags.length === 0) {
      return <Text type="secondary">无标签</Text>;
    }

    return (
      <Space wrap>
        {endpoint.tags.map((tag, index) => (
          <Tag key={index}>{tag}</Tag>
        ))}
      </Space>
    );
  };

  return (
    <Card title="标签" size="small">
      {renderTags()}
    </Card>
  );
};

TagsCard.displayName = 'TagsCard';

export default TagsCard;
