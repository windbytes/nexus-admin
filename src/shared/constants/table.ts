/**
 * @file 表格布局常量
 * @description 统一列表「操作」列宽度与单元格样式，保证各业务页操作区视觉一致。
 */

/**
 * 列表「操作」列统一宽度（px）。
 * 覆盖「编辑 + 更多」等链接按钮单行展示场景。
 */
export const TABLE_ACTION_COLUMN_WIDTH = 160;

/**
 * 操作列内联按钮容器的 Tailwind className。
 * 行为：不换行、水平居中、子项间距。
 */
export const TABLE_ACTION_CELL_CLASSNAME = 'flex flex-nowrap items-center justify-center gap-x-1';
