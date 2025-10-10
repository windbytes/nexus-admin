import { useQuery } from '@tanstack/react-query';
import { Spin, Tag, Input, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useState, useCallback, useMemo, memo } from 'react';
import type React from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { InterfacePermission } from '@/services/system/menu/menuApi';
import { permissionAssignService } from '@/services/system/permission/PermissionAssign/permissionAssignApi';
import { useTranslation } from 'react-i18next';

/**
 * 接口权限表格组件Props
 */
interface InterfacePermissionGridProps {
  checkedKeys: string[];
  onCheck: (checkedKeys: string[]) => void;
}

/**
 * 接口权限表格组件
 * 以表格形式展示接口权限分配，支持分页和搜索
 */
const InterfacePermissionGrid: React.FC<InterfacePermissionGridProps> = memo(({
  checkedKeys,
  onCheck,
}) => {
  const [searchText, setSearchText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { t } = useTranslation();

  /**
   * 查询接口权限列表
   * 支持分页和搜索
   */
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['interface-permissions', searchText, currentPage, pageSize],
    queryFn: async () => {
      return permissionAssignService.getMenuInterfacePage({
        pageNum: currentPage,
        pageSize: pageSize,
        name: searchText,
      });
    },
  });

  // 解构分页数据
  const interfaceList = pageData?.records || [];
  const total = pageData?.totalRow || 0;


  /**
   * 处理搜索
   * @param value 搜索值
   */
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    setCurrentPage(1); // 搜索时重置到第一页
  }, []);

  /**
   * 处理输入框变化
   * @param e 输入事件
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  /**
   * 处理清空搜索
   */
  const handleClear = useCallback(() => {
    setInputValue('');
    setSearchText('');
    setCurrentPage(1);
  }, []);


  /**
   * 处理分页变化
   * @param page 页码
   * @param size 每页大小
   */
  const handlePageChange = useCallback((page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  }, [pageSize]);

  /**
   * Table 列定义
   */
  const columns: ColumnsType<InterfacePermission> = useMemo(() => [
    {
      title: '所属菜单',
      dataIndex: 'menuName',
      key: 'menuName',
      width: 150,
      render: (menuName) => (
        <Tag color="blue">{t(menuName)}</Tag>
      ),
    },
    {
      title: '接口编码',
      dataIndex: 'code',
      key: 'code',
      width: 240,
      render: (code) => (
        <Tag color="purple">{code}</Tag>
      ),
    },
    {
      title: '接口名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '请求路径',
      dataIndex: 'path',
      key: 'path',
      width: 300,
      ellipsis: true,
      render: (path) => (
        <code className="bg-gray-100 px-2 py-1 rounded">{path}</code>
      ),
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      align: 'center',
      key: 'method',
      width: 100,
      render: (method) => {
        const methodColors = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red',
          PATCH: 'purple',
        };
        return (
          <Tag color={methodColors[method as keyof typeof methodColors] || 'default'}>
            {method}
          </Tag>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (remark) => remark || '暂无描述',
    },
  ], [t]);

  /**
   * Table 行选择配置
   */
  const rowSelection = useMemo(() => ({
    selectedRowKeys: checkedKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      onCheck(selectedRowKeys as string[]);
    },
    onSelectAll: (selected: boolean) => {
      if (selected) {
        // 全选时，添加当前页所有行
        const currentPageIds = interfaceList.map(item => item.id);
        const newSelectedKeys = [...new Set([...checkedKeys, ...currentPageIds])];
        onCheck(newSelectedKeys);
      } else {
        // 取消全选时，移除当前页所有行
        const currentPageIds = interfaceList.map(item => item.id);
        const newSelectedKeys = checkedKeys.filter(key => !currentPageIds.includes(key));
        onCheck(newSelectedKeys);
      }
    },
    getCheckboxProps: (record: InterfacePermission) => ({
      name: record.name,
    }),
  }), [checkedKeys, interfaceList, onCheck]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 搜索栏 */}
      <div className="p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <Input.Search
            placeholder="搜索接口权限..."
            value={inputValue}
            onChange={handleInputChange}
            onSearch={handleSearch}
            onClear={handleClear}
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Tag color="blue">
            已选择 {checkedKeys.length} 项
          </Tag>
        </div>
      </div>

      {/* 接口权限表格 */}
      <Table<InterfacePermission>
        columns={columns}
        dataSource={interfaceList}
        bordered
        size="middle"
        rowKey="id"
        loading={isLoading}
        rowSelection={rowSelection}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: handlePageChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
          showLessItems: true,
        }}
        scroll={{ x: 'max-content', y: 'calc(100vh - 656px)' }}
        className="h-full"
      />
    </div>
  );
});

export default InterfacePermissionGrid;
