import type React from 'react';
import { memo } from 'react';
import { DatabaseOutlined, FileTextOutlined, CloudUploadOutlined } from '@ant-design/icons';
import './DataSourceSelector.scss';

export type DataSourceType = 'database' | 'json' | 'file';

interface DataSourceOption {
  value: DataSourceType;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface DataSourceSelectorProps {
  value?: DataSourceType;
  onChange?: (value: DataSourceType) => void;
}

const dataSourceOptions: DataSourceOption[] = [
  {
    value: 'database',
    icon: <DatabaseOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    title: '数据库查询',
    description: '从端点查询JSON数据并生成Schema',
  },
  {
    value: 'json',
    icon: <FileTextOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
    title: 'JSON文本',
    description: '手动输入JSON文本生成Schema',
  },
  {
    value: 'file',
    icon: <CloudUploadOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
    title: '文件上传',
    description: '上传JSON文件生成Schema',
  },
];

/**
 * 数据来源选择器组件（卡片样式）
 */
const DataSourceSelector: React.FC<DataSourceSelectorProps> = memo(({ value, onChange }) => {
  const handleSelect = (sourceValue: DataSourceType) => {
    if (onChange) {
      onChange(sourceValue);
    }
  };

  return (
    <div className="data-source-selector">
      <div className="data-source-cards">
        {dataSourceOptions.map((option) => (
          <div
            key={option.value}
            className={`data-source-card ${value === option.value ? 'active' : ''}`}
            onClick={() => handleSelect(option.value)}
          >
            <div className="card-icon">{option.icon}</div>
            <div className="card-title">{option.title}</div>
            <div className="card-description">{option.description}</div>
            {value === option.value && <div className="card-check">✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
});

DataSourceSelector.displayName = 'DataSourceSelector';

export default DataSourceSelector;

