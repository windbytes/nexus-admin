import type { RoleModel } from '@/services/system/role/type';

/**
 * 角色选择模式
 */
export type RoleSelectorMode = 'single' | 'multiple' | 'select-with-refresh';

/**
 * 角色选择组件基础Props
 */
export interface BaseRoleSelectorProps {
  /** 角色列表 */
  roles: RoleModel[];
  /** 是否正在加载 */
  loading?: boolean;
  /** 占位符文本 */
  placeholder?: string;
  /** 选择器宽度 */
  width?: number;
  /** 是否显示搜索功能 */
  showSearch?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 样式类名 */
  className?: string;
}

/**
 * 单选角色选择Props
 */
export interface SingleRoleSelectorProps extends BaseRoleSelectorProps {
  /** 模式 */
  mode: 'single';
  /** 当前选中的角色编码 */
  selectedRole?: string | null;
  /** 角色选择变化回调 */
  onSelect: (roleCode: string) => void;
}

/**
 * 多选角色选择Props
 */
export interface MultipleRoleSelectorProps extends BaseRoleSelectorProps {
  /** 模式 */
  mode: 'multiple';
  /** 当前选中的角色编码列表 */
  selectedRoles: string[];
  /** 角色选择变化回调 */
  onSelect: (roleCodes: string[]) => void;
}

/**
 * 带刷新按钮的角色选择Props
 */
export interface SelectWithRefreshRoleSelectorProps extends BaseRoleSelectorProps {
  /** 模式 */
  mode: 'select-with-refresh';
  /** 当前选中的角色编码 */
  selectedRole?: string | null;
  /** 角色选择变化回调 */
  onSelect: (roleCode: string) => void;
  /** 刷新回调 */
  onRefresh: () => void;
  /** 是否显示刷新按钮 */
  showRefreshButton?: boolean;
}

/**
 * 角色选择组件Props联合类型
 */
export type UniversalRoleSelectorProps = 
  | SingleRoleSelectorProps 
  | MultipleRoleSelectorProps 
  | SelectWithRefreshRoleSelectorProps;

/**
 * 角色选项
 */
export interface RoleOption {
  label: string;
  value: string;
  disabled?: boolean;
}
