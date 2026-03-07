import { StarFilled, UserOutlined } from '@ant-design/icons';
import { Button, Card, Tag } from 'antd';
import type React from 'react';
import { memo } from 'react';
import type { AppTemplate } from '../types';

interface TemplateCardProps {
  template: AppTemplate;
  onSelect: (template: AppTemplate) => void;
}

/**
 * 模板类型标签映射
 */
const typeLabelMap: Record<string, string> = {
  workflow: '工作流',
  chatflow: 'CHATFLOW',
  chat_assistant: '聊天助手',
  agent: 'AGENT',
  text_generation: '文本生成',
};

/**
 * 模板卡片
 */
const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  return (
    <Card
      hoverable
      className="h-full transition-all duration-200 hover:shadow-lg"
      styles={{
        body: {
          padding: '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* 卡片头部 */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: template.iconBg || '#f0f0f0' }}
        >
          {template.icon}
        </div>
        <Tag color="blue" className="text-xs font-medium">
          {typeLabelMap[template.type] || template.type}
        </Tag>
      </div>

      {/* 模板名称 */}
      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">{template.name}</h3>

      {/* 模板描述 */}
      <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">{template.description}</p>

      {/* 标签 */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} className="text-xs">
              {tag}
            </Tag>
          ))}
          {template.tags.length > 3 && <Tag className="text-xs">+{template.tags.length - 3}</Tag>}
        </div>
      </div>

      {/* 卡片底部信息 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <UserOutlined />
          <span>{template.usageCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <StarFilled className="text-yellow-400" />
          <span>{template.rating}</span>
        </div>
      </div>

      {/* 使用按钮 */}
      <Button type="primary" className="w-full mt-3" onClick={() => onSelect(template)}>
        使用此模板
      </Button>
    </Card>
  );
};

export default memo(TemplateCard);
