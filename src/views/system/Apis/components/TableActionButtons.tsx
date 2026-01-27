import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { Key } from 'react';

interface TableActionButtonsProps {
  onAdd: () => void;
  onBatchDelete: () => void;
  onRefresh: () => void;
  selectedRowKeys: Key[];
}

/**
 * 接口列表操作栏：新增、批量删除、刷新
 */
const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  onAdd,
  onBatchDelete,
  onRefresh,
  selectedRowKeys,
}) => {
  return (
    <div className="flex gap-2">
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
        新增
      </Button>
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={onBatchDelete}
        disabled={selectedRowKeys.length === 0}
      >
        批量删除
      </Button>
      <Button icon={<ReloadOutlined />} onClick={onRefresh}>
        刷新
      </Button>
    </div>
  );
};

export default TableActionButtons;
