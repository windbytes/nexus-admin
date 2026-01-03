import type { TableProps } from 'antd';
import { Table } from 'antd';
import type React from 'react';
import useTableScroll from '@/hooks/useTableScroll';
import type { SysParam } from '@/services/system/params';
import '@/styles/table.full.scss';
import { useParamTableColumns } from './useParamTableColumn';

interface ParamTableProps {
  data: SysParam[];
  loading: boolean;
  selectedRowKeys: React.Key[];
  onSelectionChange: (selectedRowKeys: React.Key[], selectedRows: SysParam[]) => void;
  onEdit: (record: SysParam) => void;
  onDelete: (record: SysParam) => void;
  onStatusChange: (record: SysParam, checked: boolean) => void;
  pagination?: TableProps<SysParam>['pagination'];
}

/**
 * 参数表格
 * @param data 数据
 * @param loading 加载状态
 * @param selectedRowKeys 选中行
 * @param onSelectionChange 选择行
 * @param onEdit 编辑
 * @param onDelete 删除
 * @param onStatusChange 状态改变
 * @param pagination 分页
 * @returns
 */
const ParamTable: React.FC<ParamTableProps> = ({
  data,
  loading,
  selectedRowKeys,
  onSelectionChange,
  onEdit,
  onDelete,
  onStatusChange,
  pagination,
}) => {
  // 表格滚动配置
  const { scrollConfig, tableWrapperRef } = useTableScroll();

  // 获取表格列定义
  const columns = useParamTableColumns({
    onEdit,
    onDelete,
    onStatusChange,
  });

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectionChange,
  };

  return (
    <div className="grow min-h-0 min-w-0" ref={tableWrapperRef}>
      <Table
        bordered
        columns={columns}
        dataSource={data}
        rowKey="id"
        size="middle"
        loading={loading}
        rowSelection={rowSelection}
        pagination={pagination}
        scroll={{ x: '100%', y: scrollConfig.y }}
        classNames={{
          root: 'full-height-table',
        }}
      />
    </div>
  );
};

ParamTable.displayName = 'ParamTable';
export default ParamTable;
