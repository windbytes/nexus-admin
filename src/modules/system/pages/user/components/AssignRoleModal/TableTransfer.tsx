import type { TableColumnsType, TableProps, TransferProps } from 'antd';
import { Table, Transfer } from 'antd';
import { memo } from 'react';
import type { TransferItem } from './useTransferData';

type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

/**
 * 表格穿梭框属性
 */
interface TableTransferProps extends Omit<TransferProps<TransferItem>, 'dataSource' | 'render'> {
  dataSource: TransferItem[];
  leftColumns: TableColumnsType<TransferItem>;
  rightColumns: TableColumnsType<TransferItem>;
}

/**
 * 表格穿梭框组件
 * 基于 antd Transfer 组件，使用表格展示数据。
 */
const TableTransfer = memo<TableTransferProps>(({ leftColumns, rightColumns, ...restProps }) => {
  const renderItem = (item: TransferItem) => ({
    label: <>{item.roleName}</>,
    value: item.roleCode,
  });

  return (
    <Transfer<TransferItem> {...restProps} showSelectAll={false} render={renderItem}>
      {({
        direction,
        filteredItems,
        onItemSelectAll,
        onItemSelect,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled,
      }) => {
        const columns = direction === 'left' ? leftColumns : rightColumns;

        const rowSelection: TableRowSelection<TransferItem> = {
          getCheckboxProps: (item) => ({ disabled: listDisabled || item.disabled }),
          onSelectAll(selected, selectedRows) {
            const treeSelectedKeys = selectedRows.filter((item) => !item.disabled).map(({ key }) => key);
            const diffKeys = selected
              ? treeSelectedKeys.filter((key) => !listSelectedKeys.includes(key as string))
              : listSelectedKeys.filter((key) => !treeSelectedKeys.includes(key as string));
            onItemSelectAll(diffKeys as string[], selected);
          },
          onSelect({ key }, selected) {
            onItemSelect(key as string, selected);
          },
          selectedRowKeys: listSelectedKeys,
        };

        const handleRowClick = ({ key, disabled: itemDisabled }: TransferItem) => ({
          onClick: () => {
            if (itemDisabled || listDisabled) {
              return;
            }
            onItemSelect(key as string, !listSelectedKeys.includes(key as string));
          },
        });

        return (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems}
            size="small"
            style={{ pointerEvents: listDisabled ? 'none' : undefined }}
            onRow={handleRowClick}
            rowKey="key"
            pagination={false}
            scroll={{ y: 400 }}
          />
        );
      }}
    </Transfer>
  );
});

TableTransfer.displayName = 'TableTransfer';

export default TableTransfer;
