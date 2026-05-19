import { Table, type TableProps } from 'antd';
import type { Key } from 'react';
import useTableScroll from '@/hooks/useTableScroll';
import type { Endpoint } from '@/services/engine/endpoint/types';
import type { DrawerType, ModalType } from '../../hooks/useEndpointModals';
import { useEndpointTableColumns } from './useEndpointTableColumn';

interface EndpointTableProps {
  // 数据源
  datasource: Endpoint[];
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
  currentRow: Partial<Endpoint> | null;
  // 选中行变化
  onSelectionChange: (keys: Key[], rows: Endpoint[]) => void;
  // 分页变化
  onPageChange: (page: number, pageSize?: number) => void;
  // 打开弹窗
  openModal: (name: ModalType, record?: Endpoint) => void;
  // 打开抽屉
  openDrawer: (name: DrawerType, record?: Endpoint) => void;
  // 操作成功的回调
  onSuccess?: () => void;
}

/**
 * 端点数据展示表格
 */
const EndpointTable: React.FC<EndpointTableProps> = (props) => {
  const {
    datasource,
    loading,
    pagination,
    selectedRowKeys,
    currentRow,
    onSelectionChange,
    onPageChange,
    openModal,
    openDrawer,
    onSuccess,
  } = props;
  // 窗口管理hook
  const { scrollConfig, tableWrapperRef } = useTableScroll();
  // 获取表格列定义
  const columns = useEndpointTableColumns({
    currentRow,
    onSuccess,
    openModal,
    openDrawer,
  });

  // 行选择配置
  const rowSelection: TableProps<Endpoint>['rowSelection'] = {
    type: 'checkbox' as const,
    selectedRowKeys,
    onChange: onSelectionChange,
  };

  /**
   * 打开详情
   */
  const handleOpenDetail = (record: Endpoint) => {
    openDrawer('detail', record);
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
          showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          hideOnSinglePage: false,
          onChange: onPageChange,
        }}
        rowSelection={rowSelection}
        scroll={{ x: '100%', y: scrollConfig.y }}
        rowKey="id"
        rowClassName={(record: Endpoint) => (!record.status ? 'opacity-60 bg-gray-50' : '')}
        onRow={(record: Endpoint) => ({
          onDoubleClick: () => handleOpenDetail(record),
        })}
        classNames={{
          root: 'full-height-table',
        }}
      />
    </div>
  );
};
EndpointTable.displayName = 'EndpointTable';
export default EndpointTable;
