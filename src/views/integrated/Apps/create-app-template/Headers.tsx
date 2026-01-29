import { SearchOutlined } from '@ant-design/icons';
import { Input, Space } from 'antd';
import { TemplateTypeDropdown } from './components';
import type { TemplateType } from './types';

/**
 * 弹窗头部组件
 */
const TemplateHeaders: React.FC<TemplateHeadersProps> = ({
  searchKeyword,
  selectedTypes,
  filterOptions,
  onTypeChange,
  onSearch,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="min-w-[180px] pl-5">
        <span className="text-lg font-medium">从应用模板创建</span>
      </div>
      <div className="flex-1 max-w-[548px] p-1.5 flex items-center">
        <Space.Compact>
          <Space.Addon>
            <TemplateTypeDropdown
              selectedTypes={selectedTypes}
              onTypeChange={onTypeChange}
              filterOptions={filterOptions}
            />
          </Space.Addon>
          <Input
            className="w-full h-10"
            size="large"
            placeholder="搜索所有模版..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchKeyword}
            onChange={(e) => onSearch(e.target.value)}
            onPressEnter={(e) => onSearch((e.target as any).value)}
          />
        </Space.Compact>
      </div>
      <div className="w-[180px] h-8" />
    </div>
  );
};

export default TemplateHeaders;

interface TemplateHeadersProps {
  searchKeyword: string;
  selectedTypes: TemplateType[];
  filterOptions: Array<{ label: string; value: TemplateType; count: number }>;
  onTypeChange: (types: TemplateType[]) => void;
  onSearch: (keyword: string) => void;
}
