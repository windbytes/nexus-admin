import type React from 'react';
import { memo } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';

interface WebServiceTableActionsProps {
  onAdd: () => void;
  onBatchDelete: () => void;
  onRefresh: () => void;
  selectedRowKeys: React.Key[];
  loading: boolean;
}

/**
 * Web服务表格操作按钮组件
 */
const WebServiceTableActions: React.FC<WebServiceTableActionsProps> = memo(
  ({ onAdd, onBatchDelete, onRefresh, selectedRowKeys, loading }) => {
    return (
      <div className="mb-4">
        <Space size="small">
          <Tooltip title="新增Web服务">
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              新增
            </Button>
          </Tooltip>
          
          <Tooltip title={selectedRowKeys.length === 0 ? '请先选择要删除的数据' : '批量删除'}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={onBatchDelete}
              disabled={selectedRowKeys.length === 0}
            >
              批量删除 {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
            </Button>
          </Tooltip>
          
          <Tooltip title="刷新数据">
            <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
              刷新
            </Button>
          </Tooltip>
        </Space>
      </div>
    );
  },
);

WebServiceTableActions.displayName = 'WebServiceTableActions';

export default WebServiceTableActions;

