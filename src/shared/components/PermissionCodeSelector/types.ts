import type { ResourceType } from '@/shared/api/system/permission/type';

/**
 * 权限编码选择器 Props。
 */
export interface PermissionCodeSelectorProps {
  /** 当前选中的权限编码 */
  value?: string;
  /** 值变化回调 */
  onChange?: (value: string | undefined) => void;
  /** 资源类型：1-按钮 2-接口 4-其他 */
  resourceType: ResourceType;
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否允许清空 */
  allowClear?: boolean;
  /** 输入框最大长度（兼容表单透传，Select 侧未强制截断） */
  maxLength?: number;
  /** 每页条数 */
  pageSize?: number;
}
