import { Table, type TableProps } from 'antd';
import type { Key } from 'react';
import useTableScroll from '@/hooks/useTableScroll';
import type { RoleModel } from '@/services/system/role/type';
import type { ModalType } from '../../hooks/useRoleModal';
import { useRoleTableColumns } from './useRoleTableColumn';

interface RoleTableProps {
  // 数据源
  datasource: RoleModel[];
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
  currentRow: Partial<RoleModel> | null;
  // 选中行变化
  onSelectionChange: (keys: Key[], rows: RoleModel[]) => void;
  // 分页变化
  onPageChange: (page: number, pageSize?: number) => void;
  // 打开弹窗
  openModal: (name: ModalType, record?: RoleModel) => void;
  // 操作成功的回调
  onSuccess?: () => void;
}

/**
 * 角色数据展示表格
 */
const RoleTable: React.FC<RoleTableProps> = (props) => {
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
  // 窗口管理hook
  const { scrollConfig, tableWrapperRef } = useTableScroll();
  // 获取表格列定义
  const columns = useRoleTableColumns({
    currentRow,
    onSuccess,
    openModal,
  });

  // 行选择配置
  const rowSelection: TableProps<RoleModel>['rowSelection'] = {
    type: 'checkbox' as const,
    selectedRowKeys,
    onChange: onSelectionChange,
  };

  /**
   * 打开详情
   */
  const handleOpenDetail = (record: RoleModel) => {
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
        rowClassName={(record: RoleModel) => (!record.status ? 'opacity-60 bg-gray-50' : '')}
        onRow={(record: RoleModel) => ({
          onDoubleClick: () => handleOpenDetail(record),
        })}
        classNames={{
          root: 'full-height-table',
        }}
      />
    </div>
  );
};
RoleTable.displayName = 'RoleTable';
export default RoleTable;

