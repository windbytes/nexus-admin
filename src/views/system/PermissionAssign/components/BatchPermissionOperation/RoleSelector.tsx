import { memo } from 'react';
import type React from 'react';
import type { RoleModel } from '@/services/system/role/type';
import { UniversalRoleSelector } from '@/components/UniversalRoleSelector';

/**
 * 角色选择组件Props
 */
interface RoleSelectorProps {
  /** 选中的角色ID列表 */
  selectedRoles: string[];
  /** 角色列表 */
  roleList?: RoleModel[];
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 角色选择变化回调 */
  onRoleSelect: (roleIds: string[]) => void;
}

/**
 * 角色选择组件
 * 使用通用角色选择组件，负责角色选择和多选展示
 */
const RoleSelector: React.FC<RoleSelectorProps> = memo(({
  selectedRoles,
  roleList = [],
  isLoading = false,
  onRoleSelect,
}) => {
  return (
    <UniversalRoleSelector
      roles={roleList}
      selectedRoles={selectedRoles}
      mode="multiple"
      onSelect={onRoleSelect}
      loading={isLoading}
      placeholder="请选择角色"
    />
  );
});

RoleSelector.displayName = 'RoleSelector';

export default RoleSelector;
