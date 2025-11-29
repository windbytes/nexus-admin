import useTableScroll from '@/hooks/useTableScroll';
import type { UserModel } from '@/services/system/user/type';
import { Table } from 'antd';
import { memo, useMemo } from 'react';
import type { MenuProps, TableProps } from 'antd';
import { getColumns } from '../columns';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '@/stores/store';

interface UserTableProps {
  data: UserModel[];
  loading: boolean;
  searchParams: {
    pageNum: number;
    pageSize: number;
  };
  total: number;
  selectedRowKeys: React.Key[];
  selectedRows: UserModel[];
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
    selectedRows,
    onSelectionChange,
    onPageChange,
    onEdit,
    onDetail,
    onStatusChange,
    getMoreActions,
    canUpdateStatus,
  }) => {
    const { t } = useTranslation();
    const colorPrimary = usePreferencesStore((state) => state.preferences.theme.colorPrimary);
    const { scrollConfig, tableWrapperRef } = useTableScroll();

    const columns = useMemo(
      () =>
        getColumns(
          onEdit,
          onDetail,
          t,
          colorPrimary,
          getMoreActions,
          onStatusChange,
          canUpdateStatus
        ),
      [onEdit, onDetail, t, colorPrimary, getMoreActions, onStatusChange, canUpdateStatus]
    );

    const rowSelection = useMemo(
      () => ({
        type: 'checkbox' as const,
        selectedRowKeys,
        onChange: onSelectionChange,
      }),
      [selectedRowKeys, onSelectionChange]
    );

    const pagination = useMemo(
      () => ({
        current: searchParams.pageNum,
        pageSize: searchParams.pageSize,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条`,
        onChange: onPageChange,
      }),
      [searchParams.pageNum, searchParams.pageSize, total, onPageChange]
    );

    const rowClassName = useMemo(
      () => (record: UserModel) => (record.status === 0 ? 'opacity-60 bg-gray-50' : ''),
      []
    );

    return (
      <div className="flex-1 min-h-0" ref={tableWrapperRef}>
        <Table
          bordered
          columns={columns || []}
          dataSource={data}
          rowKey="id"
          rowSelection={rowSelection as TableProps<UserModel>['rowSelection']}
          pagination={pagination}
          loading={loading}
          size="middle"
          scroll={scrollConfig}
          rowClassName={rowClassName}
          className="h-full"
        />
      </div>
    );
  }
);

UserTable.displayName = 'UserTable';

export default UserTable;
