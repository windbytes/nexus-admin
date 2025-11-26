import { ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import type { SearchHistoryItem } from '../types';

interface Props {
  items: SearchHistoryItem[];
  selectedIndex: number;
  onSelect: (item: SearchHistoryItem) => void;
  onRemove: (id: string) => void;
  formatTime: (timestamp: number) => string;
}

/**
 * 搜索历史组件
 * @param items 搜索历史项
 * @param selectedIndex 选中索引
 * @param onSelect 选择项
 * @param onRemove 删除项
 * @param formatTime 格式化时间
 * @returns 搜索历史组件
 */
const SearchHistory: React.FC<Props> = ({ items, selectedIndex, onSelect, onRemove, formatTime }) => {
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
            <ClockCircleOutlined className="text-gray-400 mr-2" />
            <div>
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">{item.path}</div>
              <div className="text-xs text-gray-400">{formatTime(item.timestamp)}</div>
            </div>
          </div>
          <DeleteOutlined
            className="text-red-500! text-lg! cursor-pointer!"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default SearchHistory;
