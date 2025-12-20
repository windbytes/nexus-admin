import { Table, type TableProps } from 'antd';
import type React from 'react';
import useTableScroll from '@/hooks/useTableScroll';
import type { RoleModel } from '@/services/system/role/type';

interface RoleTableProps {
  tableData: RoleModel[];
  loading: boolean;
  columns: TableProps<RoleModel>['columns'];
  onRow: (record: RoleModel) => any;
  rowSelection: TableProps<RoleModel>['rowSelection'];
  // 分页配置
  pagination?: TableProps['pagination'];
}

/**
 * 角色表格
 * @param props 参数
 * @returns 表格
 */
const RoleTable: React.FC<RoleTableProps> = ({ tableData, loading, columns, onRow, rowSelection, pagination }) => {
  const { scrollConfig, tableWrapperRef } = useTableScroll('max-content');
  return (
    <div className="flex-1 min-h-0" ref={tableWrapperRef}>
      <Table<RoleModel>
        size="middle"
        onRow={onRow as any}
        bordered
        pagination={pagination as any}
        dataSource={tableData || []}
        columns={columns || []}
        loading={loading}
        rowKey="id"
        scroll={{ y: scrollConfig.y }}
        rowSelection={{ ...rowSelection }}
        rowClassName={(record: RoleModel) => (!record.status ? 'opacity-60 bg-gray-50' : '')}
        classNames={{
          root: 'full-height-table',
        }}
      />
    </div>
  );
};

export default RoleTable;
