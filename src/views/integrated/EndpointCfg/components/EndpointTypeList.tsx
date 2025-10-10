import React from 'react';
import { Table, Tag, Space, Button, Input } from 'antd';
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
    <>
      <Space direction="vertical" className="w-full mb-4" size="middle">
        <Input
          placeholder="搜索端点类型"
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => onSearch(e.target.value)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          新增端点类型
        </Button>
      </Space>
      <Table<EndpointTypeListItem>
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        size="middle"
        bordered
        rowClassName={(record) =>
          record.id === selectedId ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer hover:bg-gray-50'
        }
        onRow={(record) => ({
          onClick: () => onSelect(record),
        })}
      />
    </>
  );
};

export default React.memo(EndpointTypeList);

