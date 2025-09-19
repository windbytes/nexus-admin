import { useQuery } from '@tanstack/react-query';
import { Checkbox, Card, Spin, Empty, Tag, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useState, useCallback, useMemo } from 'react';
import type React from 'react';
import type { InterfacePermission } from '@/services/system/menu/menuApi';

/**
 * 接口权限网格组件Props
 */
interface InterfacePermissionGridProps {
  checkedKeys: string[];
  onCheck: (checkedKeys: string[]) => void;
}

/**
 * 接口权限网格组件
 * 以网格形式展示接口权限分配
 */
const InterfacePermissionGrid: React.FC<InterfacePermissionGridProps> = ({
  checkedKeys,
  onCheck,
}) => {
  const [searchText, setSearchText] = useState('');

  /**
   * 查询接口权限列表
   * 这里需要根据实际API调整
   */
  const { data: interfaceList, isLoading } = useQuery({
    queryKey: ['interface-permissions', searchText],
    queryFn: async () => {
      // 这里应该调用获取所有接口权限的API
      // 暂时返回空数组，实际应该调用相应的API
      return [] as InterfacePermission[];
    },
  });

  /**
   * 过滤后的接口权限列表
   */
  const filteredInterfaces = useMemo(() => {
    if (!interfaceList) return [];
    if (!searchText) return interfaceList;
    
    return interfaceList.filter(interfaceItem =>
      interfaceItem.code.toLowerCase().includes(searchText.toLowerCase()) ||
      interfaceItem.remark.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [interfaceList, searchText]);

  /**
   * 处理搜索
   * @param value 搜索值
   */
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  /**
   * 处理单个接口权限选中
   * @param interfaceId 接口权限ID
   * @param checked 是否选中
   */
  const handleInterfaceCheck = useCallback((interfaceId: string, checked: boolean) => {
    if (checked) {
      onCheck([...checkedKeys, interfaceId]);
    } else {
      onCheck(checkedKeys.filter(key => key !== interfaceId));
    }
  }, [checkedKeys, onCheck]);

  /**
   * 处理全选/取消全选
   * @param checked 是否全选
   */
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = filteredInterfaces.map(item => item.id);
      onCheck(allIds);
    } else {
      onCheck([]);
    }
  }, [filteredInterfaces, onCheck]);

  /**
   * 检查是否全选
   */
  const isAllSelected = useMemo(() => {
    if (filteredInterfaces.length === 0) return false;
    return filteredInterfaces.every(item => checkedKeys.includes(item.id));
  }, [filteredInterfaces, checkedKeys]);

  /**
   * 检查是否部分选中
   */
  const isIndeterminate = useMemo(() => {
    const selectedCount = filteredInterfaces.filter(item => checkedKeys.includes(item.id)).length;
    return selectedCount > 0 && selectedCount < filteredInterfaces.length;
  }, [filteredInterfaces, checkedKeys]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!interfaceList || interfaceList.length === 0) {
    return (
      <Empty
        description="暂无接口权限数据"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="mt-8"
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 搜索和全选栏 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <Input.Search
            placeholder="搜索接口权限..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              全选
            </Checkbox>
            <Tag color="blue">
              已选择 {checkedKeys.length} 项
            </Tag>
          </div>
        </div>
      </div>

      {/* 接口权限网格 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterfaces.map((interfaceItem) => (
            <Card
              key={interfaceItem.id}
              size="small"
              className={`interface-permission-card ${
                checkedKeys.includes(interfaceItem.id) ? 'border-blue-500 bg-blue-50' : ''
              }`}
              hoverable
              onClick={() => handleInterfaceCheck(interfaceItem.id, !checkedKeys.includes(interfaceItem.id))}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={checkedKeys.includes(interfaceItem.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleInterfaceCheck(interfaceItem.id, e.target.checked);
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag color="purple">
                      {interfaceItem.code}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {interfaceItem.remark || '暂无描述'}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredInterfaces.length === 0 && searchText && (
          <Empty
            description="未找到匹配的接口权限"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
};

export default InterfacePermissionGrid;
