import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, theme } from 'antd';
import type React from 'react';
import { memo } from 'react';
import type { TemplateCategory } from '../types';

const { useToken } = theme;

interface CategorySidebarProps {
  categories: TemplateCategory[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  onCreateBlank: () => void;
}

/**
 * 左侧分类导航
 */
const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onCreateBlank,
}) => {
  const { token } = useToken();
  return (
    <Card className="h-full w-[300px] p-4 overflow-y-auto">
      {/* 分类列表 */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            style={{
              backgroundColor: selectedCategory === category.id ? token.colorPrimaryBg : 'transparent',
              border: selectedCategory === category.id ? `1px solid ${token.colorPrimaryBorder}` : 'none',
            }}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-blue-50`}
            onClick={() => onCategorySelect(category.id)}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{category.count}</span>
          </div>
        ))}
      </div>

      {/* 创建空白应用按钮 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button type="primary" icon={<PlusOutlined />} className="w-full" onClick={onCreateBlank}>
          创建空白应用
        </Button>
      </div>
    </Card>
  );
};

export default memo(CategorySidebar);
