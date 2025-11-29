import useTableScroll from "@/hooks/useTableScroll";
import { Table, type TableProps } from "antd";

// 定义表格需要的参数
interface DictTableProps {
  // 表格数据
  tableData: any[];
  // 加载状态
  loading: boolean;
  // 表格列
  columns: TableProps<any>['columns'];
  // 行点击事件
  onRow: (record: any) => any;
  // 行选择事件
  rowSelection: TableProps<any>['rowSelection'];
  // 分页配置
  pagination?: TableProps<any>['pagination'];
}

/**
 * 字典表格
 * @param props 参数
 * @returns 表格
 */
const DictTable: React.FC<DictTableProps> = ({
  tableData,
  loading,
  columns,
  onRow,
  rowSelection,
  pagination
}) => {
  const { scrollConfig, tableWrapperRef } = useTableScroll('max-content');
  return (
    <div className='flex-1 min-h-0' ref={tableWrapperRef}>
      <Table
        size="small"
        onRow={onRow}
        style={{ marginTop: '8px' }}
        bordered
        pagination={pagination}
        dataSource={tableData}
        columns={columns}
        loading={loading}
        rowKey="id"
        scroll={scrollConfig}
        rowSelection={{ ...rowSelection }}
      />
    </div>
    
  );
};
export default DictTable;