import type { EndpointTypeConfig } from '@/services/integrated/endpointConfig/endpointConfigApi';
import { getIcon } from '@/utils/optimized-icons';
import { ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, Card, Input, Space, Table, Tag, Tooltip, message } from 'antd';
import React, { useState } from 'react';

const { Search } = Input;

interface EndpointTypeListProps {
  /** 数据源 */
  data: EndpointTypeConfig[];
  /** 加载状态 */
  loading: boolean;
  /** 当前选中的ID */
  selectedId?: string | undefined;
  /** 选择变更回调 */
  onSelect: (record: EndpointTypeConfig) => void;
  /** 新增回调 */
  onAdd: () => void;
  /** 搜索回调 */
  onSearch: (value: string) => void;
  /** 批量导出回调 */
  onBatchExport?: (selectedIds: string[]) => void;
  /** 导入回调 */
  onImport?: () => void;
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
  onBatchExport,
  onImport,
  pagination,
}) => {
  // 多选状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 多选变更回调 - 使用 useCallback 优化
  const handleRowSelectionChange = React.useCallback((keys: React.Key[]) => {
    setSelectedRowKeys(keys);
  }, []);

  // 获取 checkbox props - 使用 useCallback 优化
  const getCheckboxProps = React.useCallback(
    (record: EndpointTypeConfig) => ({
      name: record.typeName,
    }),
    []
  );

  // 多选配置 - 使用 useMemo 缓存
  const rowSelection = React.useMemo(
    () => ({
      selectedRowKeys,
      onChange: handleRowSelectionChange,
      getCheckboxProps,
      // 使用主题色的选中样式
      selectedRowClassName: 'ant-table-row-selected',
    }),
    [selectedRowKeys, handleRowSelectionChange, getCheckboxProps]
  );

  // 处理批量导出 - 使用 useCallback 优化
  const handleBatchExport = React.useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要导出的端点配置');
      return;
    }

    if (onBatchExport) {
      onBatchExport(selectedRowKeys as string[]);
    } else {
      message.info(`导出功能开发中，已选择 ${selectedRowKeys.length} 条记录`);
    }
  }, [selectedRowKeys, onBatchExport]);

  // 获取行 className - 使用 useCallback 优化
  const getRowClassName = React.useCallback(
    (record: EndpointTypeConfig) => {
      return record.id === selectedId ? 'ant-table-row-selected cursor-pointer' : 'cursor-pointer hover:bg-gray-50';
    },
    [selectedId]
  );

  // 获取行事件 - 使用 useCallback 优化
  const getRowProps = React.useCallback(
    (record: EndpointTypeConfig) => ({
      onClick: () => onSelect(record),
    }),
    [onSelect]
  );

  // 使用 useMemo 优化 columns 配置
  const columns: TableProps<EndpointTypeConfig>['columns'] = React.useMemo(
    () => [
      {
        title: '类型名称',
        dataIndex: 'typeName',
        key: 'typeName',
        width: 120,
        ellipsis: true,
        render: (text, record) => (
          <div className="flex items-center gap-2">
            {record.icon && getIcon(record.icon)}
            <span>{text}</span>
          </div>
        ),
      },
      {
        title: '字段数',
        key: 'fieldCount',
        width: 60,
        align: 'center',
        render: (_, record) => record.schemaFields?.length || 0,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        align: 'center',
        render: (status: boolean) => <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '禁用'}</Tag>,
      },
    ],
    []
  );

  return (
    <Card
      className="h-full flex flex-col w-[360px] shrink-0"
      classNames={{
        body: 'flex flex-col h-[calc(100%-58px)] py-0! px-4!',
        header: 'py-3! px-4!',
      }}
      title={
        <div className="flex justify-between">
          <div>端点类型列表</div>
          <Space>
            <Tooltip title="新增端点配置">
              <Button type="text" icon={<PlusOutlined />} onClick={onAdd} />
            </Tooltip>

            {onImport && (
              <Tooltip title="导入端点配置">
                <Button type="text" icon={<ImportOutlined className="text-blue-500!" />} onClick={onImport} />
              </Tooltip>
            )}

            <Tooltip title="导出端点配置">
              <Button
                type="text"
                icon={<ExportOutlined className="text-orange-500!" />}
                onClick={handleBatchExport}
                disabled={selectedRowKeys.length === 0}
              />
            </Tooltip>
          </Space>
        </div>
      }
    >
      <Space.Compact>
        <Search placeholder="请输入端点类型名称" allowClear onSearch={onSearch} enterButton className="my-2" />
      </Space.Compact>
      <Table<EndpointTypeConfig>
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        rowSelection={rowSelection}
        pagination={
          pagination
            ? {
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                onChange: pagination.onChange,
              }
            : false
        }
        size="middle"
        bordered
        className="flex-1 overflow-auto my-2!"
        scroll={{ y: 'calc(100vh - 300px)', x: 'max-content' }}
        rowClassName={getRowClassName}
        onRow={getRowProps}
      />
    </Card>
  );
};

export default React.memo(EndpointTypeList);
