import { DownOutlined, FilterOutlined } from '@ant-design/icons';
import { Button, Checkbox, Dropdown, type MenuProps } from 'antd';
import type React from 'react';
import { memo } from 'react';
import type { TemplateType } from '../types';

interface TemplateTypeDropdownProps {
  selectedTypes: TemplateType[];
  onTypeChange: (types: TemplateType[]) => void;
  filterOptions: Array<{ label: string; value: TemplateType; count: number }>;
}

/**
 * 模板类型筛选下拉
 */
const TemplateTypeDropdown: React.FC<TemplateTypeDropdownProps> = ({ selectedTypes, onTypeChange, filterOptions }) => {
  // 处理类型选择变化
  const handleTypeChange = (type: TemplateType, checked: boolean) => {
    if (checked) {
      onTypeChange([...selectedTypes, type]);
    } else {
      onTypeChange(selectedTypes.filter((t) => t !== type));
    }
  };

  // 下拉选项
  const items: MenuProps['items'] = filterOptions.map((option) => ({
    label: (
      <Checkbox
        checked={selectedTypes.includes(option.value)}
        onChange={(e) => handleTypeChange(option.value, e.target.checked)}
      >
        {option.label} ({option.count})
      </Checkbox>
    ),
    key: option.value,
  }));

  const displayText = selectedTypes.length === 0 ? '所有类型' : `已选择 ${selectedTypes.length} 个类型`;

  return (
    <Dropdown trigger={['click']} menu={{ items }} placement="bottomLeft">
      <Button type="text" icon={<FilterOutlined />}>
        {displayText}
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default memo(TemplateTypeDropdown);
