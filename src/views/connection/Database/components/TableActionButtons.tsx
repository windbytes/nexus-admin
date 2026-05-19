import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Badge, Button, Space } from 'antd';
import type { Key } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface TableActionButtonsProps {
  onAdd: () => void;
  onRefresh: () => void;
  onBatchDelete: () => void;
  selectedRowKeys: Key[];
  loading?: boolean;
}

/**
 * 表格工具区：新增、刷新、批量删除（依赖行选中）。
 */
const TableActionButtons = memo(
  ({ onAdd, onRefresh, onBatchDelete, selectedRowKeys, loading = false }: TableActionButtonsProps) => {
    const { t } = useTranslation();

    return (
      <Space size="middle">
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          {t('common.operation.add')}
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
          {t('common.operation.refresh')}
        </Button>
        <Button
          danger
          type="default"
          icon={<DeleteOutlined />}
          disabled={selectedRowKeys.length === 0}
          onClick={onBatchDelete}
        >
          批量删除
          {selectedRowKeys.length > 0 ? <Badge count={selectedRowKeys.length} size="small" className="ml-1" /> : null}
        </Button>
      </Space>
    );
  }
);

TableActionButtons.displayName = 'ConnectionDatabaseTableActionButtons';

export default TableActionButtons;
