import type { TableProps as AntdTableProps } from 'antd';
import { Card, Table } from 'antd';
import { Toolbar } from './components/Toolbar';
import { useColumnSettings } from './hooks/useColumnSettings';
import { useDensity } from './hooks/useDensity';
import type { ProTableProps } from './types';
import './ProTable.css';
import '@/styles/table.full.css';
import useTableScroll from '@/shared/hooks/useTableScroll';

/**
 * ProTable 高级表格组件。
 *
 * 基于 antd `Table` + `Card` 封装，提供：
 * - 顶部工具栏（标题、操作按钮、刷新、密度、列设置）
 * - 列显示/排序/固定配置
 * - 自适应纵向滚动（占满外层 flex 容器）
 *
 * @typeParam T - 行数据类型
 * @param props - {@link ProTableProps}，除 Pro 扩展字段外透传给 antd Table
 * @returns 带工具栏的表格 React 元素
 */
function ProTable<T = unknown>(props: ProTableProps<T>) {
  const {
    columns,
    title,
    cardVariant = 'borderless',
    showTitle = true,
    showToolbar = true,
    actionButtons,
    onRefresh,
    onColumnSettingChange,
    initialColumnSettings,
    cardClassNames,
    toolbarExtra,
    rowSelection,
    ...tableProps
  } = props;

  // 密度管理
  const { density, changeDensity } = useDensity(tableProps.size || 'middle');

  // 列配置管理
  const { columnSettings, updateSettings, resetSettings, processedColumns } = useColumnSettings(
    columns,
    initialColumnSettings,
    onColumnSettingChange
  );

  // 表格滚动配置
  const { scrollConfig, tableWrapperRef } = useTableScroll();

  // 获取选中的行
  const selectedRowKeys = rowSelection?.selectedRowKeys;

  return (
    <Card
      className="pro-table-card"
      variant={cardVariant}
      classNames={cardClassNames}
      title={
        <Toolbar
          title={title}
          showTitle={showTitle}
          actionButtons={actionButtons}
          selectedRowKeys={selectedRowKeys}
          onRefresh={onRefresh}
          density={density}
          onDensityChange={changeDensity}
          columnSettings={columnSettings}
          onColumnSettingChange={updateSettings}
          onReset={resetSettings}
          extra={toolbarExtra}
        />
      }
    >
      {/* 表格 */}
      <div className={`pro-table-wrapper ${cardClassNames?.table?.container || ''}`} ref={tableWrapperRef}>
        <Table<T>
          scroll={{ x: 'max-content', y: scrollConfig.y }}
          {...tableProps}
          columns={processedColumns as AntdTableProps<T>['columns']}
          size={density}
          className={`pro-table ${tableProps.className || ''}`}
          classNames={{
            root: cardClassNames?.table?.root || '',
            ...tableProps.classNames,
          }}
          rowSelection={rowSelection}
        />
      </div>
    </Card>
  );
}

ProTable.displayName = 'ProTable';

export default ProTable;
