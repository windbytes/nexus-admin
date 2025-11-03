import { DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import React from 'react';

interface EndpointTableActionsProps {
  /** 新增回调 */
  onAdd: () => void;
  /** 批量删除回调 */
  onBatchDelete: () => void;
  /** 导入回调 */
  onImport: () => void;
  /** 批量导出回调 */
  onBatchExport: () => void;
  /** 刷新回调 */
  onRefresh: () => void;
  /** 选中的行 */
  selectedRowKeys: React.Key[];
  /** 加载状态 */
  loading: boolean;
}

/**
 * 端点表格操作按钮组件
 */
const EndpointTableActions: React.FC<EndpointTableActionsProps> = ({
  onAdd,
  onBatchDelete,
  onImport,
  onBatchExport,
  onRefresh,
  selectedRowKeys,
  loading,
}) => {
  const hasSelected = selectedRowKeys.length > 0;

  return (
    <div className="mb-4 flex justify-between items-center">
      <Space size="small">
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          新增端点
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={onBatchDelete}
          disabled={!hasSelected || loading}
        >
          批量删除
        </Button>
        <Button icon={<ImportOutlined />} onClick={onImport}>
          导入
        </Button>
        <Button
          icon={<ExportOutlined />}
          onClick={onBatchExport}
          disabled={!hasSelected || loading}
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
