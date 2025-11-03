import { usePermission } from '@/hooks/usePermission';
import type { Endpoint } from '@/services/integrated/endpoint/endpointApi';
import { ENDPOINT_TYPE_OPTIONS } from '@/services/integrated/endpoint/endpointApi';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { TablePaginationConfig, TableProps } from 'antd';
import { Button, Space, Switch, Table, Tag, Tooltip } from 'antd';
import React from 'react';

interface EndpointTableProps {
  /** 数据源 */
  data: Endpoint[];
  /** 加载状态 */
  loading: boolean;
  /** 选中的行 */
  selectedRowKeys: React.Key[];
  /** 选择变更回调 */
  onSelectionChange: (selectedRowKeys: React.Key[], selectedRows: Endpoint[]) => void;
  /** 查看回调 */
  onView: (record: Endpoint) => void;
  /** 编辑回调 */
  onEdit: (record: Endpoint) => void;
  /** 删除回调 */
  onDelete: (record: Endpoint) => void;
  /** 导出回调 */
  onExport: (record: Endpoint) => void;
  /** 测试回调 */
  onTest: (record: Endpoint) => void;
  /** 克隆回调 */
  onClone: (record: Endpoint) => void;
  /** 版本管理回调 */
  onVersion: (record: Endpoint) => void;
  /** 日志查看回调 */
  onLog: (record: Endpoint) => void;
  /** 状态变更回调 */
  onStatusChange: (record: Endpoint, checked: boolean) => void;
  /** 分页配置 */
  pagination: TablePaginationConfig;
}

/**
 * 端点表格组件
 */
const EndpointTable: React.FC<EndpointTableProps> = ({
  data,
  loading,
  selectedRowKeys,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onExport,
  onTest,
  onClone,
  onVersion,
  onLog,
  onStatusChange,
  pagination,
}) => {
  // 是否有编辑、导出、删除权限
  const canEdit = usePermission(['integrated:endpoint:edit']);
  const canExport = usePermission(['integrated:endpoint:export']);
  const canDelete = usePermission(['integrated:endpoint:delete']);

  /**
   * 获取端点类型标签颜色
   */
  const getEndpointTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      http: 'blue',
      database: 'green',
      webservice: 'purple',
      file: 'orange',
      timer: 'cyan',
      mq: 'magenta',
    };
    return colorMap[type] || 'default';
  };

  /**
   * 获取端点类型名称
   */
  const getEndpointTypeName = (type: string): string => {
    const option = ENDPOINT_TYPE_OPTIONS.find((opt) => opt.value === type);
    return option?.label || type;
  };

  const columns: TableProps<Endpoint>['columns'] = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      ellipsis: {
        showTitle: false,
      },
      render: (name) => (
        <Tooltip placement="topLeft" title={name}>
          {name}
        </Tooltip>
      ),
    },
    {
      title: '类型',
      dataIndex: 'endpointType',
      key: 'endpointType',
      width: 150,
      render: (type: string) => <Tag color={getEndpointTypeColor(type)}>{getEndpointTypeName(type)}</Tag>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => category || '-',
    },
    {
      title: '模式',
      dataIndex: 'mode',
      key: 'mode',
      width: 80,
      align: 'center',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 220,
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          {description || '-'}
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (status: boolean, record) => (
        <Switch
          checked={status}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          onChange={(checked) => onStatusChange(record, checked)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 180,
      render: (time) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => onView(record)} />
          </Tooltip>

          {canEdit && (
            <Tooltip title="编辑">
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
            </Tooltip>
          )}

          {canEdit && (
            <Tooltip title="克隆">
              <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => onClone(record)} />
            </Tooltip>
          )}

          <Tooltip title="测试连接">
            <Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => onTest(record)} />
          </Tooltip>

          <Tooltip title="版本管理">
            <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => onVersion(record)} />
          </Tooltip>

          <Tooltip title="操作日志">
            <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => onLog(record)} />
          </Tooltip>

          {canExport && (
            <Tooltip title="导出配置">
              <Button type="link" size="small" icon={<ExportOutlined />} onClick={() => onExport(record)} />
            </Tooltip>
          )}

          {canDelete && (
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(record)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table<Endpoint>
      rowKey="id"
      bordered
      size="middle"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      scroll={{ x: 'max-content' }}
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectionChange,
      }}
      onRow={(record) => ({
        onDoubleClick: () => onView(record),
      })}
    />
  );
};

export default React.memo(EndpointTable);
