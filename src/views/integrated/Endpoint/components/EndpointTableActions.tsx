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
  /** 预加载Modal回调（可选） */
  onPreloadModal?: () => void;
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
  onPreloadModal,
  selectedRowKeys,
  loading,
}) => {
  const hasSelected = selectedRowKeys.length > 0;

  return (
    <div className="flex grow justify-between items-center">
      <Space size="small">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          onMouseEnter={onPreloadModal} // 鼠标悬停时预加载Modal
        >
          新增
        </Button>
        <Button danger icon={<DeleteOutlined />} onClick={onBatchDelete} disabled={!hasSelected || loading}>
          批量删除
        </Button>
        <Button icon={<ImportOutlined className="text-(--ant-orange-5)!" />} onClick={onImport}>
          导入
        </Button>
        <Button
          icon={<ExportOutlined className="text-(--ant-green-5)!" />}
          onClick={onBatchExport}
          disabled={!hasSelected || loading}
        >
          批量导出
        </Button>
      </Space>
      <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
    </div>
  );
};

export default React.memo(EndpointTableActions);
