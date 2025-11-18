import { DeleteOutlined, DownloadOutlined, ImportOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import type React from 'react';
import { memo } from 'react';

interface DataModeTableActionsProps {
  onAdd: () => void;
  onBatchDelete: () => void;
  onBatchExport: () => void;
  onImportSchema: () => void;
  onRefresh: () => void;
  selectedRowKeys: React.Key[];
  loading?: boolean;
}

/**
 * 数据模式表格操作按钮组件
 */
const DataModeTableActions: React.FC<DataModeTableActionsProps> = memo(
  ({ onAdd, onBatchDelete, onBatchExport, onImportSchema, onRefresh, selectedRowKeys, loading = false }) => {
    const hasSelection = selectedRowKeys.length > 0;

    return (
      <div className="flex items-center justify-between mb-4">
        <Space>
          <Tooltip title="新增数据模式">
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              新增
            </Button>
          </Tooltip>

          <Tooltip title={hasSelection ? `删除选中的 ${selectedRowKeys.length} 项` : '请先选择要删除的数据模式'}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={onBatchDelete}
              disabled={!hasSelection || loading}
            >
              批量删除
            </Button>
          </Tooltip>

          <Tooltip
            title={hasSelection ? `导出选中的 ${selectedRowKeys.length} 个Schema` : '请先选择要导出的数据模式'}
          >
            <Button
              icon={<DownloadOutlined />}
              onClick={onBatchExport}
              disabled={!hasSelection || loading}
            >
              批量导出
            </Button>
          </Tooltip>
          <Tooltip title="导入Schema">
            <Button icon={<ImportOutlined />} onClick={onImportSchema}>
              导入Schema
            </Button>
          </Tooltip>
        </Space>

        <Tooltip title="刷新数据">
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
            刷新
          </Button>
        </Tooltip>
      </div>
    );
  },
);

DataModeTableActions.displayName = 'DataModeTableActions';

export default DataModeTableActions;

