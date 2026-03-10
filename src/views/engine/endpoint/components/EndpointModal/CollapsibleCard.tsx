import type { CollapseProps } from 'antd';
import { Card, Collapse } from 'antd';
import type React from 'react';
import type { CollapsibleCardProps } from './types';

/**
 * 可收缩卡片组件 - 使用 Collapse + Card 组合
 */
const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ title, children, defaultCollapsed = false }) => {
  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: title,
      children: <Card variant="borderless">{children}</Card>,
    },
  ];

  return <Collapse defaultActiveKey={defaultCollapsed ? [] : ['1']} items={items} />;
};

CollapsibleCard.displayName = 'CollapsibleCard';

export default CollapsibleCard;
