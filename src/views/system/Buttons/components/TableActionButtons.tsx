import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import type { Key } from 'react';

interface TableActionButtonsProps {
  selectedMenuId: string | null;
  selectedRowKeys: Key[];
  onAdd: () => void;
  onBatchDelete: () => void;
  onRefresh: () => void;
}

/**
 * 按钮列表表格上方操作区：新增、批量删除、刷新
 */
const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  selectedMenuId,
  selectedRowKeys,
  onAdd,
  onBatchDelete,
  onRefresh,
}) => {
  const { modal } = App.useApp();

  const handleAdd = () => {
    if (!selectedMenuId) {
      modal.warning({ content: '请先在左侧选择要配置按钮的菜单（仅叶子/可点击页面）' });
      return;
    }
    onAdd();
  };

  return (
    <div className="flex gap-2">
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
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
