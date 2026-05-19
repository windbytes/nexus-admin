import type { ColProps } from 'antd';

/**
 * Card 内 grid 多列查询表单：label 在 24 栅格中的占比。
 * 略宽于 antd 默认，避免 md 多列时输入区挤压、遮挡 label。
 */
export const SEARCH_FORM_GRID_LABEL_COL: ColProps = { span: 7 };
export const SEARCH_FORM_GRID_WRAPPER_COL: ColProps = { span: 17 };

/** 使用固定宽度 label 的查询表单（如端点筛选；略宽于 80px 避免四字标签与控件重叠） */
export const SEARCH_FORM_FLEX_LABEL_COL: ColProps = { flex: '0 0 100px' };
export const SEARCH_FORM_FLEX_WRAPPER_COL: ColProps = { flex: '1 1 0' };
