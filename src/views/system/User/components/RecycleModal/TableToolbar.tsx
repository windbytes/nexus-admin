import { Button } from 'antd';
import { memo } from 'react';

/**
 * 表格工具栏属性
 */
interface TableToolbarProps {
  selectedCount: number;
  onBatchRestore: () => void;
  restoring?: boolean;
}

/**
 * 表格工具栏组件（批量操作按钮）
 */
const TableToolbar = memo<TableToolbarProps>(({ selectedCount, onBatchRestore, restoring }) => {
  return (
    <Button type="primary" disabled={selectedCount === 0} onClick={onBatchRestore} loading={restoring}>
      批量恢复
    </Button>
  );
});

TableToolbar.displayName = 'TableToolbar';

export default TableToolbar;
