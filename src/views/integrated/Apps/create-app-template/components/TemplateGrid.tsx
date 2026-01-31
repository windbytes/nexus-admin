import { Empty, Spin } from 'antd';
import type React from 'react';
import { memo } from 'react';
import type { AppTemplate } from '../types';
import TemplateCard from './TemplateCard';

interface TemplateGridProps {
  templates: AppTemplate[];
  loading: boolean;
  onTemplateSelect: (template: AppTemplate) => void;
}

/**
 * 模板网格展示
 */
const TemplateGrid: React.FC<TemplateGridProps> = ({ templates, loading, onTemplateSelect }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Empty description="暂无模板数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} onSelect={onTemplateSelect} />
      ))}
    </div>
  );
};

export default memo(TemplateGrid);
