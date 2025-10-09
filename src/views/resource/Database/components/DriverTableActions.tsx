import type React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { memo } from 'react';

interface DriverTableActionsProps {
  onAdd: () => void;
  onBatchDelete: () => void;
  onBatchDownload: () => void;
  onRefresh: () => void;
  selectedRowKeys: React.Key[];
  loading?: boolean;
}

/**
 * 驱动表格操作按钮组件
 */
const DriverTableActions: React.FC<DriverTableActionsProps> = memo(
  ({ onAdd, onBatchDelete, onBatchDownload, onRefresh, selectedRowKeys, loading = false }) => {
    const hasSelection = selectedRowKeys.length > 0;

    return (
      <div className="flex items-center justify-between mb-4">
        <Space>
          <Tooltip title="新增驱动">
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              新增
            </Button>
          </Tooltip>

          <Tooltip title={hasSelection ? `删除选中的 ${selectedRowKeys.length} 项` : '请先选择要删除的驱动'}>
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
            title={hasSelection ? `下载选中的 ${selectedRowKeys.length} 个驱动` : '请先选择要下载的驱动'}
          >
            <Button
              icon={<DownloadOutlined />}
              onClick={onBatchDownload}
              disabled={!hasSelection || loading}
            >
              批量下载
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

DriverTableActions.displayName = 'DriverTableActions';

export default DriverTableActions;

