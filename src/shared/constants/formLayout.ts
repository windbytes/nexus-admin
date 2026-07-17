import type { ColProps } from 'antd';

/**
 * @file 查询表单布局常量
 * @description 统一 Card 内多列表单的 label / wrapper 栅格占比，避免各页面各自硬编码。
 */

/**
 * Card 内 grid 多列查询表单：label 在 24 栅格中的占比。
 * 略宽于 antd 默认，避免 md 多列时输入区挤压、遮挡 label。
 */
export const SEARCH_FORM_GRID_LABEL_COL: ColProps = { span: 7 };

/**
 * Card 内 grid 多列查询表单：控件区在 24 栅格中的占比。
 * 与 {@link SEARCH_FORM_GRID_LABEL_COL} 配套使用（7 + 17 = 24）。
 */
export const SEARCH_FORM_GRID_WRAPPER_COL: ColProps = { span: 17 };

/**
 * 使用固定宽度 label 的查询表单 label 列配置（约 100px）。
 */
export const SEARCH_FORM_FLEX_LABEL_COL: ColProps = { flex: '0 0 100px' };

/**
 * 使用固定宽度 label 的查询表单控件列配置（占满剩余空间）。
 */
export const SEARCH_FORM_FLEX_WRAPPER_COL: ColProps = { flex: '1 1 0' };
