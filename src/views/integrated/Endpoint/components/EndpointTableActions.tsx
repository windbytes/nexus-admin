import { usePermission } from '@/hooks/usePermission';
import { DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import React from 'react';

interface EndpointTableActionsProps {
  /** 新增回调 */
  onAdd: () => void;
  /** 批量删除回调 */
  onBatchDelete: () => void;
  /** 批量导出回调 */
  onBatchExport: () => void;
  /** 导入回调 */
  onImport: () => void;
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
  onImport,
  onRefresh,
  selectedRowKeys,
  loading,
}) => {
  // 判断是否有权限
  const canAdd = usePermission(['integrated:endpoint:add']);
  const canDelete = usePermission(['integrated:endpoint:delete']);
  const canImport = usePermission(['integrated:endpoint:import']);
  const canExport = usePermission(['integrated:endpoint:export']);
  return (
    <div className="mb-4 flex justify-between items-center">
      <Space>
        {canAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            新增端点
          </Button>
        )}

        {canDelete && (
          <Button danger icon={<DeleteOutlined />} onClick={onBatchDelete} disabled={selectedRowKeys.length === 0}>
            批量删除
          </Button>
        )}
        {canImport && (
          <Button icon={<ImportOutlined />} onClick={onImport}>
            导入
          </Button>
        )}

        {canExport && (
          <Button icon={<ExportOutlined />} onClick={onBatchExport} disabled={selectedRowKeys.length === 0}>
            批量导出
          </Button>
        )}
      </Space>

      <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading ?? false}>
        刷新
      </Button>
    </div>
  );
};

export default React.memo(EndpointTableActions);
