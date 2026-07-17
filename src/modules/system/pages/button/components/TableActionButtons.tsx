/**
 * @file 按钮列表表格上方操作区
 */

import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import type { Key } from 'react';
import { useButtonPermissions } from '../hooks/useButtonPermissions';

interface TableActionButtonsProps {
  selectedMenuId: string | null;
  selectedRowKeys: Key[];
  onAdd: () => void;
  onBatchDelete: () => void;
  onRefresh: () => void;
}

/**
 * 按钮列表操作栏：新增、批量删除、刷新。
 *
 * @param props - 选中态与回调
 */
function TableActionButtons({
  selectedMenuId,
  selectedRowKeys,
  onAdd,
  onBatchDelete,
  onRefresh,
}: TableActionButtonsProps) {
  const { modal } = App.useApp();
  const { canAdd, canBatchDelete } = useButtonPermissions();

  /**
   * 未选菜单时提示；有权限时打开新增。
   */
  function handleAdd() {
    if (!selectedMenuId) {
      modal.warning({ content: '请先在左侧选择要配置按钮的菜单（仅叶子/可点击页面）' });
      return;
    }
    if (!canAdd) {
      modal.error({
        title: '权限不足',
        content: '您没有新增按钮的权限，请联系管理员获取相应权限。',
      });
      return;
    }
    onAdd();
  }

  const actionsDisabled = !selectedMenuId;

  return (
    <div className="flex gap-2">
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={actionsDisabled || !canAdd}>
        新增
      </Button>
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={onBatchDelete}
        disabled={actionsDisabled || selectedRowKeys.length === 0 || !canBatchDelete}
      >
        批量删除
      </Button>
      <Button icon={<ReloadOutlined />} onClick={onRefresh} disabled={actionsDisabled}>
        刷新
      </Button>
    </div>
  );
}

export default TableActionButtons;
