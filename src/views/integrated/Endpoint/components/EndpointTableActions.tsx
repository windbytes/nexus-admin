import React from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';

interface EndpointTableActionsProps {
  /** 新增回调 */
  onAdd: () => void;
  /** 批量删除回调 */
  onBatchDelete: () => void;
  /** 批量导出回调 */
  onBatchExport: () => void;
  /** 刷新回调 */
  onRefresh: () => void;
  /** 选中的行数 */
  selectedRowKeys: React.Key[];
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 端点表格操作按钮组件
 */
const EndpointTableActions: React.FC<EndpointTableActionsProps> = ({
  onAdd,
  onBatchDelete,
  onBatchExport,
  onRefresh,
  selectedRowKeys,
  loading,
}) => {
  return (
    <div className="mb-4 flex justify-between items-center">
      <Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          新增端点
        </Button>

        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={onBatchDelete}
          disabled={selectedRowKeys.length === 0}
        >
          批量删除
        </Button>

        <Button
          icon={<ExportOutlined />}
          onClick={onBatchExport}
          disabled={selectedRowKeys.length === 0}
        >
          批量导出
        </Button>
      </Space>

      <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
        刷新
      </Button>
    </div>
  );
};

export default React.memo(EndpointTableActions);

