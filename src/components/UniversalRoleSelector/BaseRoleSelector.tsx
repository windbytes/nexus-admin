import { Select } from 'antd';
import { useMemo, memo } from 'react';
import type React from 'react';
import type { RoleOption } from './types';

/**
 * 基础角色选择组件Props
 */
interface BaseRoleSelectorProps {
  /** 角色选项列表 */
  options: RoleOption[];
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
  /** 是否多选 */
  multiple?: boolean;
  /** 当前选中的值 */
  value?: string | string[] | null;
  /** 选择变化回调 */
  onChange?: (value: string | string[]) => void;
}

/**
 * 基础角色选择组件
 * 提供统一的角色选择功能
 */
const BaseRoleSelector: React.FC<BaseRoleSelectorProps> = memo(({
  options,
  loading = false,
  placeholder = '请选择角色',
  width = 300,
  showSearch = true,
  disabled = false,
  className,
  multiple = false,
  value,
  onChange,
}) => {
  return (
    <Select
      mode={multiple ? 'multiple' : undefined}
      placeholder={placeholder}
      style={{ width }}
      value={value}
      onChange={onChange}
      loading={loading}
      disabled={disabled}
      showSearch={showSearch}
      className={className}
      filterOption={(input, option) => 
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={options}
    />
  );
});

BaseRoleSelector.displayName = 'BaseRoleSelector';

export default BaseRoleSelector;
