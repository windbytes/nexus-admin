/**
 * @file 接口列表操作栏
 */

import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { App, Button } from 'antd';
import type { Key } from 'react';
import { useApiPermissions } from '../hooks/useApiPermissions';

interface TableActionButtonsProps {
  selectedMenuId: string | null;
  onAdd: () => void;
  onBatchDelete: () => void;
  onRefresh: () => void;
  selectedRowKeys: Key[];
}

/**
 * 接口列表操作栏：新增、批量删除、刷新。
 *
 * @param props - 选中态与回调
 */
function TableActionButtons({
  selectedMenuId,
  onAdd,
  onBatchDelete,
  onRefresh,
  selectedRowKeys,
}: TableActionButtonsProps) {
  const { modal } = App.useApp();
  const { canAdd, canBatchDelete } = useApiPermissions();
  const actionsDisabled = !selectedMenuId;

  /**
   * 权限校验后新增。
   */
  function handleAdd() {
    if (!canAdd) {
      modal.error({
        title: '权限不足',
        content: '您没有新增接口的权限，请联系管理员获取相应权限。',
      });
      return;
    }
    onAdd();
  }

  /**
   * 权限校验后批量删除。
   */
  function handleBatchDelete() {
    if (!canBatchDelete) {
      modal.error({
        title: '权限不足',
        content: '您没有批量删除接口的权限，请联系管理员获取相应权限。',
      });
      return;
    }
    onBatchDelete();
  }

  return (
    <div className="flex gap-2">
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={actionsDisabled || !canAdd}>
        新增
      </Button>
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={handleBatchDelete}
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
