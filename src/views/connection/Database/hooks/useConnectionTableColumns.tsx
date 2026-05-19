import { DeleteOutlined, EditOutlined, FundProjectionScreenOutlined } from '@ant-design/icons';
import { Button, Switch, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/constants/table';
import type { DatabaseConnectionRecord } from '@/services/connection/database/type';
import type { DatabaseDriver } from '@/services/resource/database/driverApi';

interface UseConnectionTableColumnsParams {
  driversById: Map<string, DatabaseDriver>;
  onEdit: (record: DatabaseConnectionRecord) => void;
  onDelete: (record: DatabaseConnectionRecord) => void;
  onToggleStatus: (record: DatabaseConnectionRecord, enabled: boolean) => void;
  onViewPoolStats: (record: DatabaseConnectionRecord) => void;
  statusLoading?: boolean;
}

/**
 * 列定义与回调引用解耦，避免父组件每次 render 重建 columns 导致表格整表重绘。
 */
export function useConnectionTableColumns({
  driversById,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewPoolStats,
  statusLoading = false,
}: UseConnectionTableColumnsParams): ColumnsType<DatabaseConnectionRecord> {
  return [
      {
        title: '连接名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        width: 160,
      },
      {
        title: '编码',
        dataIndex: 'code',
        key: 'code',
        width: 140,
        ellipsis: true,
      },
      {
        title: '驱动',
        dataIndex: 'driverId',
        key: 'driverId',
        width: 180,
        ellipsis: true,
        render: (_: string, record) => driversById.get(record.driverId)?.name ?? record.driverId,
      },
      {
        title: '库类型',
        dataIndex: 'databaseType',
        key: 'databaseType',
        width: 120,
        render: (v: string) => <Tag>{v}</Tag>,
      },
      {
        title: '主机',
        key: 'host',
        width: 140,
        ellipsis: true,
        render: (_: unknown, record) => record.config?.endpoint?.host ?? '-',
      },
      {
        title: '状态',
        dataIndex: 'enabled',
        key: 'enabled',
        width: 150,
        render: (enabled: boolean, record) => (
          <div className="flex items-center gap-2">
            <Tag color={enabled ? 'success' : 'default'}>{enabled ? '启用' : '停用'}</Tag>
            <Switch
              size="small"
              checked={enabled}
              loading={statusLoading}
              onChange={(checked) => onToggleStatus(record, checked)}
            />
          </div>
        ),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        ellipsis: true,
      },
      {
        title: '操作',
        key: 'actions',
        fixed: 'right' as const,
        width: TABLE_ACTION_COLUMN_WIDTH,
        align: 'center',
        render: (_: unknown, record) => (
          <div className={TABLE_ACTION_CELL_CLASSNAME}>
            <Tooltip title="编辑">
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
            </Tooltip>
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                disabled={record.enabled}
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
              />
            </Tooltip>
            <Tooltip title="连接池指标">
              <Button
                type="link"
                size="small"
                icon={<FundProjectionScreenOutlined />}
                onClick={() => onViewPoolStats(record)}
              />
            </Tooltip>
          </div>
        ),
      },
  ];
}
