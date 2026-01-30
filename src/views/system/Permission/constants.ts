/**
 * 资源类型选项
 */
export const resourceTypeOptions = [
  { value: 1, label: '按钮' },
  { value: 2, label: '接口' },
  { value: 4, label: '其他' },
];

/**
 * 状态选项
 */
export const statusOptions = [
  { value: true, label: '启用' },
  { value: false, label: '停用' },
];

/**
 * 资源类型映射
 */
export const resourceTypeMap: Record<number, { label: string; color: string }> = {
  1: { label: '按钮', color: 'blue' },
  2: { label: '接口', color: 'green' },
  4: { label: '其他', color: 'orange' },
};
