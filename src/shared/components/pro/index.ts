/**
 * Pro 组件统一出口。
 *
 * 高阶封装：ProTable 等，用于快速构建后台 CRUD 页面。
 */

export { default as ProTable } from './ProTable';
export type {
  ColumnFixed,
  ColumnSetting,
  ProColumnType,
  ProTableProps,
  TableDensity,
  ToolbarProps,
} from './ProTable/types';
