import { Table, type TableProps } from 'antd';
import type { Key } from 'react';
import useTableScroll from '@/hooks/useTableScroll';
import type { UserModel } from '@/services/system/user/type';
import type { ModalType } from '../../hooks/useUserModals';
import { useUserTableColumns } from './useUserTableColumn';
import '@/styles/table.full.scss';

interface UserTableProps {
  // 数据源
  datasource: UserModel[];
  // 加载状态
  loading: boolean;
  // 分页信息
  pagination: {
    pageNum: number;
    pageSize: number;
    total: number;
  };
  // 选中行
  selectedRowKeys: React.Key[];
  // 当前操作的行数据
  currentRow: Partial<UserModel> | null;
  // 选中行变化
  onSelectionChange: (keys: Key[], rows: UserModel[]) => void;
  // 分页变化
  onPageChange: (page: number, pageSize?: number) => void;
  // 打开弹窗
  openModal: (name: ModalType, record?: UserModel) => void;
  // 操作成功的回调
  onSuccess?: () => void;
}

/**
 * 用户数据展示表格
 */
const UserTable: React.FC<UserTableProps> = (props) => {
  const {
    datasource,
    loading,
    pagination,
    selectedRowKeys,
    currentRow,
    onSelectionChange,
    onPageChange,
    openModal,
    onSuccess,
  } = props;
  // 表格滚动配置
  const { scrollConfig, tableWrapperRef } = useTableScroll();
  // 获取表格列定义
  const columns = useUserTableColumns({
    currentRow,
    onSuccess,
    openModal,
  });

  // 行选择配置
  const rowSelection: TableProps<UserModel>['rowSelection'] = {
    type: 'checkbox' as const,
    selectedRowKeys,
    onChange: onSelectionChange,
  };

  /**
   * 打开详情
   */
  const handleOpenDetail = (record: UserModel) => {
    openModal('view', record);
  };

  return (
    <div className="grow min-h-0 min-w-0" ref={tableWrapperRef}>
      <Table
        bordered
        size="middle"
        columns={columns}
        dataSource={datasource}
        loading={loading}
        pagination={{
          current: pagination.pageNum,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) => `${range[0]} - ${range[1]} / ${total} 条`,
          hideOnSinglePage: false,
          onChange: onPageChange,
        }}
        rowSelection={rowSelection}
        scroll={{ x: '100%', y: scrollConfig.y }}
        rowKey="id"
        rowClassName={(record: UserModel) => (record.status === 0 ? 'opacity-60 bg-gray-50' : '')}
        onRow={(record: UserModel) => ({
          onDoubleClick: () => handleOpenDetail(record),
        })}
        classNames={{
          root: 'full-height-table',
        }}
      />
    </div>
  );
};
UserTable.displayName = 'UserTable';
export default UserTable;
