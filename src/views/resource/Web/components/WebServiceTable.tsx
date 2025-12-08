import { DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, Space, Switch, Table, Tag, Tooltip } from 'antd';
import type React from 'react';
import { memo } from 'react';
import useTableScroll from '@/hooks/useTableScroll';
import type { WebService } from '@/services/resource/webservice/webServiceApi';
import '@/styles/table.full.scss';

interface WebServiceTableProps {
  data: WebService[];
  loading: boolean;
  selectedRowKeys: React.Key[];
  onSelectionChange: (selectedRowKeys: React.Key[], selectedRows: WebService[]) => void;
  onView: (record: WebService) => void;
  onEdit: (record: WebService) => void;
  onDelete: (record: WebService) => void;
  onExport: (record: WebService) => void;
  onStatusChange: (record: WebService, checked: boolean) => void;
  pagination?: TableProps<WebService>['pagination'];
}

/**
 * 获取录入方式标签
 */
const getInputTypeTag = (inputType: string) => {
  const typeMap = {
    manual: { color: 'blue', text: '图形化编辑' },
    file: { color: 'green', text: '文件上传' },
    url: { color: 'orange', text: 'URL获取' },
  };
  const config = typeMap[inputType as keyof typeof typeMap] || { color: 'default', text: inputType };
  return <Tag color={config.color}>{config.text}</Tag>;
};

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes?: number): string => {
  if (!bytes) {
    return '-';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Web服务表格组件
 */
const WebServiceTable: React.FC<WebServiceTableProps> = memo(
  ({
    data,
    loading,
    selectedRowKeys,
    onSelectionChange,
    onView,
    onEdit,
    onDelete,
    onExport,
    onStatusChange,
    pagination,
  }) => {
    const { tableWrapperRef, scrollConfig } = useTableScroll('max-content');
    // 表格列配置
    const columns: TableProps<WebService>['columns'] = [
      {
        title: '序号',
        key: 'index',
        width: 70,
        align: 'center',
        fixed: 'left',
        render: (_: any, __: any, index: number) => {
          const current = (pagination as any)?.current || 1;
          const pageSize = (pagination as any)?.pageSize || 10;
          return (current - 1) * pageSize + index + 1;
        },
      },
      {
        title: '服务名称',
        dataIndex: 'name',
        key: 'name',
        width: 180,
        fixed: 'left',
        ellipsis: {
          showTitle: false,
        },
        render: (value: string) => (
          <Tooltip placement="topLeft" title={value}>
            <span className="text-blue-600">{value}</span>
          </Tooltip>
        ),
      },
      {
        title: '服务编码',
        dataIndex: 'code',
        key: 'code',
        width: 150,
        ellipsis: {
          showTitle: false,
        },
      },
      {
        title: '录入方式',
        dataIndex: 'inputType',
        key: 'inputType',
        width: 120,
        align: 'center',
        render: (value: string) => getInputTypeTag(value),
      },
      {
        title: '命名空间',
        dataIndex: 'namespace',
        key: 'namespace',
        width: 200,
        ellipsis: {
          showTitle: false,
        },
      },
      {
        title: '操作数量',
        dataIndex: 'operations',
        key: 'operationCount',
        width: 100,
        align: 'center',
        render: (operations: string[]) => <Tag color="cyan">{operations.length || 0}</Tag>,
      },
      {
        title: '文件信息',
        key: 'fileInfo',
        width: 200,
        render: (_: any, record: WebService) => {
          if (record.inputType === 'file' && record.fileInfo) {
            return (
              <div className="text-xs">
                <div className="flex items-center gap-1">
                  <FileTextOutlined className="text-blue-500" />
                  <Tooltip title={record.fileInfo.fileName}>
                    <span className="text-gray-700 truncate max-w-[120px]">{record.fileInfo.fileName}</span>
                  </Tooltip>
                </div>
                <div className="text-gray-500 mt-1">{formatFileSize(record.fileInfo.fileSize)}</div>
              </div>
            );
          }
          if (record.inputType === 'url' && record.wsdlUrl) {
            return (
              <Tooltip title={record.wsdlUrl}>
                <a
                  href={record.wsdlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-xs truncate block max-w-[180px]"
                >
                  {record.wsdlUrl}
                </a>
              </Tooltip>
            );
          }
          return <span className="text-gray-400">-</span>;
        },
      },
      {
        title: '分类',
        dataIndex: 'category',
        key: 'category',
        width: 100,
        align: 'center',
        render: (value: string) => {
          if (!value) {
            return '-';
          }
          const colorMap: Record<string, string> = {
            soap: 'blue',
            rest: 'green',
            integration: 'purple',
            business: 'orange',
            custom: 'cyan',
          };
          return <Tag color={colorMap[value] || 'default'}>{value}</Tag>;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        align: 'center',
        render: (value: boolean, record: WebService) => (
          <Switch
            checked={value}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={(checked) => onStatusChange(record, checked)}
          />
        ),
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
          <Tooltip placement="topLeft" title={value}>
            <span>{value || '-'}</span>
          </Tooltip>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 160,
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 160,
      },
      {
        title: '操作',
        key: 'action',
        width: 220,
        align: 'center',
        fixed: 'right',
        render: (_: any, record: WebService) => (
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
            <Tooltip title="导出WSDL">
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
      <div className="flex-1 min-h-0" ref={tableWrapperRef}>
        <Table
          bordered
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={pagination}
          scroll={scrollConfig}
          size="middle"
          classNames={{
            root: 'full-height-table',
          }}
        />
      </div>
    );
  }
);

WebServiceTable.displayName = 'WebServiceTable';

export default WebServiceTable;
