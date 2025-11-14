import type { DatabaseDriver } from '@/services/resource/database/driverApi';
import { DatabaseOutlined, DeleteOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import type { TablePaginationConfig, TableProps } from 'antd';
import { Button, Space, Switch, Table, Tag, Tooltip } from 'antd';
import type React from 'react';
import { memo } from 'react';

interface DriverTableProps {
  data: DatabaseDriver[];
  loading: boolean;
  selectedRowKeys: React.Key[];
  onSelectionChange: (selectedRowKeys: React.Key[], selectedRows: DatabaseDriver[]) => void;
  onEdit: (record: DatabaseDriver) => void;
  onDelete: (record: DatabaseDriver) => void;
  onDownload: (record: DatabaseDriver) => void;
  onStatusChange: (record: DatabaseDriver, checked: boolean) => void;
  pagination?: TableProps<DatabaseDriver>['pagination'];
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (typeof bytes !== 'number' || isNaN(bytes)) return '-';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
};

/**
 * 获取数据库类型标签颜色
 */
const getDatabaseTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    MySQL: 'blue',
    PostgreSQL: 'cyan',
    Oracle: 'red',
    SQLServer: 'orange',
    DB2: 'purple',
    SQLite: 'green',
    MariaDB: 'geekblue',
    DM: 'magenta',
    KingBase: 'volcano',
    GBase: 'gold',
  };
  return colorMap[type] || 'default';
};

/**
 * 驱动表格组件
 */
const DriverTable: React.FC<DriverTableProps> = memo(
  ({ data, loading, selectedRowKeys, onSelectionChange, onEdit, onDelete, onDownload, onStatusChange, pagination }) => {
    // 表格列配置
    const columns: TableProps<DatabaseDriver>['columns'] = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        fixed: 'left',
        width: 70,
        align: 'center',
        hidden: true, // 隐藏序号列
        render: (_: any, __: any, index: number) => {
          const pageNum = (pagination as TablePaginationConfig)?.current || 1;
          const pageSize = (pagination as TablePaginationConfig)?.pageSize || 20;
          return (pageNum - 1) * pageSize + index + 1;
        },
      },
      {
        title: '驱动名称',
        dataIndex: 'name',
        key: 'name',
        width: 180,
        fixed: 'left',
        ellipsis: true,
        sorter: (a: DatabaseDriver, b: DatabaseDriver) => a.name.localeCompare(b.name),
        render: (value: string) => (
          <div className="flex items-center gap-2">
            <DatabaseOutlined className="text-blue-500!" />
            <span>{value}</span>
          </div>
        ),
      },
      {
        title: '数据库类型',
        dataIndex: 'databaseType',
        key: 'databaseType',
        width: 120,
        align: 'left',
        sorter: (a: DatabaseDriver, b: DatabaseDriver) => a.databaseType.localeCompare(b.databaseType),
        render: (value: string) => <Tag color={getDatabaseTypeColor(value)}>{value}</Tag>,
      },
      {
        title: '驱动类',
        dataIndex: 'driverClass',
        key: 'driverClass',
        width: 280,
        ellipsis: {
          showTitle: false,
        },
      },
      {
        title: '驱动版本',
        dataIndex: 'driverVersion',
        key: 'driverVersion',
        width: 120,
        align: 'left',
        render: (value: string) => value || '-',
      },
      {
        title: '文件名称',
        dataIndex: 'fileName',
        key: 'fileName',
        width: 200,
        ellipsis: {
          showTitle: false,
        },
      },
      {
        title: '文件大小',
        dataIndex: 'fileSize',
        key: 'fileSize',
        width: 100,
        align: 'center',
        sorter: (a: DatabaseDriver, b: DatabaseDriver) => a.fileSize - b.fileSize,
        render: (value: number) => formatFileSize(value),
      },
      {
        title: '上传时间',
        dataIndex: 'uploadTime',
        key: 'uploadTime',
        width: 180,
        align: 'center',
        sorter: (a: DatabaseDriver, b: DatabaseDriver) => a.uploadTime.localeCompare(b.uploadTime),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        align: 'center',
        render: (value: boolean, record: DatabaseDriver) => (
          <Switch
            checked={value}
            onChange={(checked) => onStatusChange(record, checked)}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        ),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 200,
        ellipsis: {
          showTitle: false,
        },
        render: (value: string) => (
          <Tooltip title={value}>
            <span>{value || '-'}</span>
          </Tooltip>
        ),
      },
      {
        title: '操作',
        key: 'action',
        width: 160,
        align: 'center',
        fixed: 'right',
        render: (_: any, record: DatabaseDriver) => (
          <Space size="small">
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined className="text-blue-500! hover:text-blue-600!" />}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
            <Tooltip title="下载">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined className="text-green-500! hover:text-green-600!" />}
                onClick={() => onDownload(record)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined className="text-red-500! hover:text-red-600!" />}
                onClick={() => onDelete(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ];

    // 行选择配置
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectionChange,
    };

    return (
      <Table
        bordered
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={pagination as TablePaginationConfig}
        scroll={{ x: 'max-content', y: 'calc(100vh - 420px)' }}
        size="middle"
      />
    );
  }
);

DriverTable.displayName = 'DriverTable';

export default DriverTable;
