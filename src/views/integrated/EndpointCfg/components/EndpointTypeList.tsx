import React from 'react';
import { Table, Tag, Button, Input } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { EndpointTypeListItem } from '@/services/integrated/endpointConfig/endpointConfigApi';

interface EndpointTypeListProps {
  /** 数据源 */
  data: EndpointTypeListItem[];
  /** 加载状态 */
  loading: boolean;
  /** 当前选中的ID */
  selectedId?: string | undefined;
  /** 选择变更回调 */
  onSelect: (record: EndpointTypeListItem) => void;
  /** 新增回调 */
  onAdd: () => void;
  /** 搜索回调 */
  onSearch: (value: string) => void;
  /** 分页配置 */
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

/**
 * 端点类型列表组件（左侧）
 */
const EndpointTypeList: React.FC<EndpointTypeListProps> = ({
  data,
  loading,
  selectedId,
  onSelect,
  onAdd,
  onSearch,
  pagination,
}) => {
  const columns: TableProps<EndpointTypeListItem>['columns'] = [
    {
      title: '类型名称',
      dataIndex: 'typeName',
      key: 'typeName',
      ellipsis: true,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          {record.icon && <span className={record.icon} />}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '字段数',
      dataIndex: 'fieldCount',
      key: 'fieldCount',
      width: 80,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '禁用'}</Tag>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 搜索区域 */}
      <div className="flex-shrink-0 mb-4">
        <div className="text-sm text-gray-600 mb-2">端点类型管理</div>
        <Input
          placeholder="搜索端点类型"
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* 表格区域 */}
      <div className="flex-1 overflow-hidden">
        <Table<EndpointTypeListItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={pagination ? {
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total) => `共 ${total} 条`,
            onChange: pagination.onChange,
          } : false}
          size="middle"
          bordered
          scroll={{ y: 'calc(100vh - 300px)' }}
          rowClassName={(record) =>
            record.id === selectedId ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer hover:bg-gray-50'
          }
          onRow={(record) => ({
            onClick: () => onSelect(record),
          })}
        />
      </div>

      {/* 新增按钮 */}
      <div className="flex-shrink-0 mt-4">
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          新增
        </Button>
      </div>
    </div>
  );
};

export default React.memo(EndpointTypeList);

