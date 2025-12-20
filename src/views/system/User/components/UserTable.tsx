import type { MenuProps, TableProps } from 'antd';
import { Table } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useTableScroll from '@/hooks/useTableScroll';
import type { UserModel } from '@/services/system/user/type';
import { getColumns } from '../columns';
import '@/styles/table.full.scss';

interface UserTableProps {
  data: UserModel[];
  loading: boolean;
  searchParams: {
    pageNum: number;
    pageSize: number;
  };
  total: number;
  selectedRowKeys: React.Key[];
  onSelectionChange: (keys: string[], rows: UserModel[]) => void;
  onPageChange: (page: number, pageSize?: number) => void;
  onEdit: (record: UserModel) => void;
  onDetail: (record: UserModel) => void;
  onStatusChange: (record: UserModel, checked: boolean) => void;
  getMoreActions: (record: UserModel) => MenuProps['items'];
  canUpdateStatus: boolean;
}

/**
 * 用户表格组件
 */
const UserTable = memo<UserTableProps>(
  ({
    data,
    loading,
    searchParams,
    total,
    selectedRowKeys,
    onSelectionChange,
    onPageChange,
    onEdit,
    onDetail,
    onStatusChange,
    getMoreActions,
    canUpdateStatus,
  }) => {
    const { t } = useTranslation();
    const { scrollConfig, tableWrapperRef } = useTableScroll();

    const columns = useMemo(
      () => getColumns(onEdit, t, getMoreActions, onStatusChange, canUpdateStatus),
      [onEdit, t, getMoreActions, onStatusChange, canUpdateStatus]
    );

    const rowSelection = useMemo(
      () => ({
        type: 'checkbox' as const,
        selectedRowKeys,
        onChange: onSelectionChange,
      }),
      [selectedRowKeys, onSelectionChange]
    );

    return (
      <div className="grow min-h-0 min-w-0" ref={tableWrapperRef}>
        <Table
          bordered
          columns={columns || []}
          dataSource={data}
          rowKey="id"
          rowSelection={rowSelection as TableProps<UserModel>['rowSelection']}
          pagination={{
            current: searchParams.pageNum,
            pageSize: searchParams.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => `${range[0]} - ${range[1]} / ${total} 条`,
            hideOnSinglePage: false,
            onChange: onPageChange,
          }}
          loading={loading}
          size="middle"
          scroll={{ x: '100%', y: scrollConfig.y }}
          rowClassName={(record: UserModel) => (record.status === 0 ? 'opacity-60 bg-gray-50' : '')}
          onRow={(record: UserModel) => ({
            onDoubleClick: () => onDetail(record),
          })}
          classNames={{
            root: 'full-height-table',
          }}
        />
      </div>
    );
  }
);

UserTable.displayName = 'UserTable';

export default UserTable;
