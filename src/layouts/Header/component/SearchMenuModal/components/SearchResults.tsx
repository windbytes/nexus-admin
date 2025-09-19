import { Badge, theme } from 'antd';
import { getIcon } from '@/utils/optimized-icons';
import HighlightText from './HighlightText';
import type { SearchResultItem } from '../types';

interface Props {
  items: SearchResultItem[];
  selectedIndex: number;
  onSelect: (item: SearchResultItem) => void;
}

/**
 * 搜索结果组件
 * @param items 搜索结果项
 * @param selectedIndex 选中索引
 * @param onSelect 选择项
 * @returns 搜索结果组件
 */
const SearchResults: React.FC<Props> = ({ items, selectedIndex, onSelect }) => {
  const { token } = theme.useToken();

  return (
    <div className="overflow-y-auto flex-1">
      {items.map((item, index) => (
        <div
          key={item.id}
          data-index={index}
          className="cursor-pointer px-4 py-2 flex items-center justify-between transition-all duration-200"
          style={
            index === selectedIndex
              ? {
                  backgroundColor: token.colorPrimaryBg,
                  borderLeft: `2px solid ${token.colorPrimary}`,
                  borderRadius: token.borderRadius,
                  margin: '2px 8px',
                }
              : {
                  borderRadius: token.borderRadius,
                  margin: '2px 8px',
                }
          }
          onMouseEnter={(e) => {
            if (index !== selectedIndex) {
              e.currentTarget.style.backgroundColor = token.colorBgTextHover;
            }
          }}
          onMouseLeave={(e) => {
            if (index !== selectedIndex) {
              e.currentTarget.style.backgroundColor = '';
            }
          }}
          onClick={() => onSelect(item)}
        >
          <div className="flex items-center flex-1">
            {item.icon && <div className="mr-3 text-gray-400">{getIcon(item.icon)}</div>}
            <div className="flex-1">
              <div className="font-medium text-gray-900 flex items-center">
                <HighlightText text={item.name} keyword={item.keyword} />
                {item.score && item.score >= 90 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-600 px-1 rounded">精确匹配</span>
                )}
              </div>
              {item.parentPath && <div className="text-xs text-gray-500 mt-1">路径: {item.parentPath}</div>}
              {item.path && (
                <div className="text-xs text-gray-400 mt-1">
                  <HighlightText text={item.path} keyword={item.keyword} />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {item.score && <div className="mr-2 text-xs text-gray-400">{item.score}%</div>}
            <Badge count={index + 1} size="small" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
