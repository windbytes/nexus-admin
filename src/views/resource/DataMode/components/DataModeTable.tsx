import type { JsonDataMode } from '@/services/resource/datamode/dataModeApi';
import {
  CloudUploadOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { TablePaginationConfig, TableProps } from 'antd';
import { Button, Space, Switch, Table, Tag, Tooltip } from 'antd';
import type React from 'react';
import { memo } from 'react';

interface DataModeTableProps {
  data: JsonDataMode[];
  loading: boolean;
  selectedRowKeys: React.Key[];
  onSelectionChange: (selectedRowKeys: React.Key[], selectedRows: JsonDataMode[]) => void;
  onEdit: (record: JsonDataMode) => void;
  onDelete: (record: JsonDataMode) => void;
  onView: (record: JsonDataMode) => void;
  onExport: (record: JsonDataMode) => void;
  onStatusChange: (record: JsonDataMode, checked: boolean) => void;
  pagination?: TableProps<JsonDataMode>['pagination'];
}

/**
 * 获取数据来源标签
 */
const getDataSourceTag = (source: 'database' | 'json' | 'file') => {
  const sourceConfig = {
    database: {
      icon: <DatabaseOutlined />,
      color: 'blue',
      text: '数据库',
    },
    json: {
      icon: <FileTextOutlined />,
      color: 'green',
      text: 'JSON',
    },
    file: {
      icon: <CloudUploadOutlined />,
      color: 'orange',
      text: '文件',
    },
  };

  const config = sourceConfig[source];
  return (
    <Tag icon={config.icon} color={config.color}>
      {config.text}
    </Tag>
  );
};

/**
 * 获取分类标签颜色
 */
const getCategoryColor = (category?: string): string => {
  const colorMap: Record<string, string> = {
    api: 'blue',
    database: 'cyan',
    message: 'purple',
    file: 'orange',
    custom: 'magenta',
    other: 'default',
  };
  return colorMap[category || 'other'] || 'default';
};

/**
 * 数据模式表格组件
 */
const DataModeTable: React.FC<DataModeTableProps> = memo(
  ({
    data,
    loading,
    selectedRowKeys,
    onSelectionChange,
    onEdit,
    onDelete,
    onView,
    onExport,
    onStatusChange,
    pagination,
  }) => {
    // 表格列配置
    const columns: TableProps<JsonDataMode>['columns'] = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        fixed: 'left',
        width: 70,
        align: 'center',
        hidden: true,
        render: (_: any, __: any, index: number) => {
          const pageNum = (pagination as TablePaginationConfig)?.current || 1;
          const pageSize = (pagination as TablePaginationConfig)?.pageSize || 20;
          return (pageNum - 1) * pageSize + index + 1;
        },
      },
      {
        title: '模式名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        fixed: 'left',
        ellipsis: true,
        render: (value: string) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{value}</span>
          </div>
        ),
      },
      {
        title: '模式编码',
        dataIndex: 'code',
        key: 'code',
        width: 150,
        ellipsis: true,
        render: (value: string) => (
          <Tooltip title={value}>
            <code className="bg-gray-100 px-2 py-1 rounded">{value}</code>
          </Tooltip>
        ),
      },
      {
        title: '分类',
        dataIndex: 'category',
        key: 'category',
        width: 120,
        align: 'center',
        render: (value: string) => {
          const category = value || 'other';
          const label =
            {
              api: 'API接口',
              database: '数据库表',
              message: '消息队列',
              file: '文件数据',
              custom: '自定义',
              other: '其他',
            }[category] || '其他';
          return <Tag color={getCategoryColor(category)}>{label}</Tag>;
        },
      },
      {
        title: '数据来源',
        dataIndex: 'dataSource',
        key: 'dataSource',
        width: 110,
        align: 'center',
        render: (value: 'database' | 'json' | 'file') => getDataSourceTag(value),
      },
      {
        title: 'Schema版本',
        dataIndex: 'schemaVersion',
        key: 'schemaVersion',
        width: 120,
        align: 'center',
        render: (value: string) => value || 'v1.0',
      },
      {
        title: '字段数量',
        dataIndex: 'fields',
        key: 'fields',
        width: 100,
        align: 'center',
        render: (value: number) => <Tag color="geekblue">{value || 0} 个</Tag>,
      },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        width: 200,
        ellipsis: true,
        render: (tags: string[]) => {
          if (!tags || tags.length === 0) return '-';
          return (
            <Space size="small" wrap>
              {tags.slice(0, 2).map((tag, index) => (
                <Tag key={index} color="processing">
                  {tag}
                </Tag>
              ))}
              {tags.length > 2 && <Tag>+{tags.length - 2}</Tag>}
            </Space>
          );
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        align: 'center',
        render: (value: boolean, record: JsonDataMode) => (
          <Switch
            checked={value}
            onChange={(checked) => onStatusChange(record, checked)}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180,
        align: 'center',
        render: (value: string) => {
          if (!value) return '-';
          return value;
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 180,
        align: 'center',
        render: (value: string) => {
          if (!value) return '-';
          return value;
        },
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
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
        width: 200,
        align: 'center',
        fixed: 'right',
        render: (_: any, record: JsonDataMode) => (
          <Space size="small">
            <Tooltip title="查看">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined className="text-purple-500! hover:text-purple-600!" />}
                onClick={() => onView(record)}
              />
            </Tooltip>
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined className="text-blue-500! hover:text-blue-600!" />}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
            <Tooltip title="导出">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined className="text-green-500! hover:text-green-600!" />}
                onClick={() => onExport(record)}
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

DataModeTable.displayName = 'DataModeTable';

export default DataModeTable;
