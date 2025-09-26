import type { RoleModel } from '@/services/system/role/type';
import { Table, type TableProps } from 'antd';
import type React from 'react';

interface RoleTableProps {
  tableData: RoleModel[];
  loading: boolean;
  columns: TableProps['columns'];
  onRow: (record: RoleModel) => any;
  rowSelection: TableProps['rowSelection'];
  height: number;
  // 分页配置
  pagination?: TableProps['pagination'];
}

/**
 * 角色表格
 * @param props 参数
 * @returns 表格
 */
const RoleTable: React.FC<RoleTableProps> = ({
  tableData,
  loading,
  columns,
  onRow,
  rowSelection,
  height,
  pagination
}) => {
  return (
    <Table
      size="small"
      onRow={onRow as any}
      style={{ marginTop: '8px' }}
      bordered
      pagination={pagination as any}
      dataSource={tableData || []}
      columns={columns || []}
      loading={loading}
      rowKey="id"
      scroll={{ x: 'max-content', y: height - 128 }}
      rowSelection={{ ...rowSelection }}
    />
  );
};

export default RoleTable;
