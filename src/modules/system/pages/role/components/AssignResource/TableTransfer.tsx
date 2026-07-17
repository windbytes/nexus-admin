/**
 * @file 本地表格穿梭框（角色授权资源专用，不上提共享）
 */

import type { PaginationProps, TableColumnsType, TableProps, TransferProps } from 'antd';
import { Pagination, Table, Transfer } from 'antd';
import type { PermissionTransferItem } from './useTransferData';

type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

/** 分页模式：frontend=全量 slice；backend=当前页不再 slice */
type PaginationMode = 'frontend' | 'backend';

interface TableTransferProps extends Omit<TransferProps<PermissionTransferItem>, 'dataSource' | 'render'> {
  dataSource: PermissionTransferItem[];
  leftColumns: TableColumnsType<PermissionTransferItem>;
  rightColumns: TableColumnsType<PermissionTransferItem>;
  leftPagination?: PaginationProps;
  rightPagination?: PaginationProps;
  leftData?: PermissionTransferItem[];
  rightData?: PermissionTransferItem[];
  leftPaginationMode?: PaginationMode;
  rightPaginationMode?: PaginationMode;
  loading?: boolean;
}

/**
 * 基于 antd Transfer 的表格穿梭框，支持左右分页。
 *
 * @param props - Transfer 属性与左右列/分页配置
 */
function TableTransfer({
  leftColumns,
  rightColumns,
  leftPagination,
  rightPagination,
  leftData,
  rightData,
  leftPaginationMode = 'frontend',
  rightPaginationMode = 'frontend',
  loading,
  ...restProps
}: TableTransferProps) {
  /**
   * @param item - 穿梭项
   */
  function renderItem(item: PermissionTransferItem) {
    return {
      label: <>{item.permName}</>,
      value: item.permCode,
    };
  }

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
        const paginationMode = direction === 'left' ? leftPaginationMode : rightPaginationMode;
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

        /**
         * @param row - 当前行
         */
        function handleRowClick({ key, disabled: itemDisabled }: PermissionTransferItem) {
          return {
            onClick: () => {
              if (itemDisabled || listDisabled) {
                return;
              }
              onItemSelect(key as string, !listSelectedKeys.includes(key as string));
            },
          };
        }

        const paginatedItems =
          pagination && paginationMode === 'frontend'
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
              loading={loading}
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
}

export default TableTransfer;
