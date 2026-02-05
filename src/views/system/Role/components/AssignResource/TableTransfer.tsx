import type { PaginationProps, TableColumnsType, TableProps, TransferProps } from 'antd';
import { Pagination, Table, Transfer } from 'antd';
import type React from 'react';
import type { PermissionTransferItem } from './useTransferData';

type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

/**
 * 表格穿梭框属性
 */
interface TableTransferProps extends Omit<TransferProps<PermissionTransferItem>, 'dataSource' | 'render'> {
  dataSource: PermissionTransferItem[];
  leftColumns: TableColumnsType<PermissionTransferItem>;
  rightColumns: TableColumnsType<PermissionTransferItem>;
  leftPagination?: PaginationProps;
  rightPagination?: PaginationProps;
  leftData?: PermissionTransferItem[];
  rightData?: PermissionTransferItem[];
}

/**
 * 表格穿梭框组件
 * 基于 antd Transfer 组件，使用表格展示数据，支持左右分页
 */
const TableTransfer: React.FC<TableTransferProps> = ({
  leftColumns,
  rightColumns,
  leftPagination,
  rightPagination,
  leftData,
  rightData,
  ...restProps
}) => {
  const renderItem = (item: PermissionTransferItem) => ({
    label: <>{item.permName}</>,
    value: item.permCode,
  });

  return (
    <Transfer<PermissionTransferItem> {...restProps} showSelectAll={false} render={renderItem}>
      {({
        direction,
        filteredItems,
        onItemSelectAll,
        onItemSelect,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled,
      }) => {
        const columns = direction === 'left' ? leftColumns : rightColumns;
        const pagination = direction === 'left' ? leftPagination : rightPagination;
        // 根据方向使用对应的数据源
        const dataSource = direction === 'left' ? leftData || filteredItems : rightData || filteredItems;

        const rowSelection: TableRowSelection<PermissionTransferItem> = {
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

        const handleRowClick = ({ key, disabled: itemDisabled }: PermissionTransferItem) => ({
          onClick: () => {
            if (itemDisabled || listDisabled) {
              return;
            }
            onItemSelect(key as string, !listSelectedKeys.includes(key as string));
          },
        });

        // 分页处理
        const paginatedItems = pagination
          ? dataSource.slice(
              ((pagination.current || 1) - 1) * (pagination.pageSize || 20),
              (pagination.current || 1) * (pagination.pageSize || 20)
            )
          : dataSource;

        return (
          <div className="flex flex-col h-full p-3">
            <Table
              bordered
              rowSelection={rowSelection}
              columns={columns}
              dataSource={paginatedItems}
              size="small"
              style={{ pointerEvents: listDisabled ? 'none' : undefined }}
              onRow={handleRowClick}
              rowKey="key"
              pagination={false}
              scroll={{ y: 'calc(70vh - 300px)', x: 'max-content' }}
            />
            {pagination && (
              <div className="mt-2 flex justify-end">
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showSizeChanger={pagination.showSizeChanger}
                  showQuickJumper={pagination.showQuickJumper}
                  showTotal={pagination.showTotal}
                  onChange={pagination.onChange}
                  onShowSizeChange={pagination.onShowSizeChange}
                />
              </div>
            )}
          </div>
        );
      }}
    </Transfer>
  );
};

export default TableTransfer;
