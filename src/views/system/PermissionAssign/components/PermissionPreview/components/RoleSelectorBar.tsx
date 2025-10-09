import { memo } from 'react';
import type React from 'react';
import type { RoleModel } from '@/services/system/role/type';
import { UniversalRoleSelector } from '@/components/UniversalRoleSelector';

/**
 * 角色选择栏组件Props
 */
interface RoleSelectorBarProps {
  /** 当前选中的角色编码 */
  currentRoleCode?: string | null;
  /** 角色列表 */
  roleList?: RoleModel[];
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 是否显示刷新按钮 */
  showRefreshButton?: boolean;
  /** 角色选择变化回调 */
  onRoleSelect: (roleCode: string) => void;
  /** 刷新回调 */
  onRefresh: () => void;
}

/**
 * 角色选择栏组件
 * 使用通用角色选择组件，负责角色选择和刷新操作
 */
const RoleSelectorBar: React.FC<RoleSelectorBarProps> = memo(({
  currentRoleCode,
  roleList = [],
  isLoading = false,
  showRefreshButton = true,
  onRoleSelect,
  onRefresh,
}) => {
  return (
    <UniversalRoleSelector
      roles={roleList}
      selectedRole={currentRoleCode}
      mode="select-with-refresh"
      onSelect={onRoleSelect}
      onRefresh={onRefresh}
      loading={isLoading}
      showRefreshButton={showRefreshButton}
      placeholder="请选择要查看权限的角色"
      width={300}
    />
  );
});

RoleSelectorBar.displayName = 'RoleSelectorBar';

export default RoleSelectorBar;
