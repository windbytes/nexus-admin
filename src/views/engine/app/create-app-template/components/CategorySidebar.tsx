import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, theme } from 'antd';
import type React from 'react';
import { memo } from 'react';
import { getIcon } from '@/utils/optimized-icons';
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
    <Card className="flex h-full min-h-0 w-[300px] flex-col p-4" classNames={{ body: 'flex flex-col flex-1 min-h-0' }}>
      {/* 分类列表：占据剩余高度，超出时内部滚动 */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
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
              <span className="text-lg">{getIcon(category.icon)}</span>
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{category.count}</span>
          </div>
        ))}
      </div>

      {/* 创建空白应用按钮：固定在底部 */}
      <div className="shrink-0 border-t border-gray-200 pt-4">
        <Button type="primary" icon={<PlusOutlined />} className="w-full" onClick={onCreateBlank}>
          创建空白应用
        </Button>
      </div>
    </Card>
  );
};

export default memo(CategorySidebar);
