import { useMemo, memo } from 'react';
import type React from 'react';
import type { RoleModel } from '@/services/system/role/type';
import BaseRoleSelector from './BaseRoleSelector';
import RoleSelectorBar from './RoleSelectorBar';
import MultipleRoleSelector from './MultipleRoleSelector';
import type { 
  UniversalRoleSelectorProps, 
  SingleRoleSelectorProps, 
  MultipleRoleSelectorProps, 
  SelectWithRefreshRoleSelectorProps 
} from './types';

/**
 * 通用角色选择组件
 * 根据不同的模式提供不同的角色选择功能
 */
const UniversalRoleSelector: React.FC<UniversalRoleSelectorProps> = memo((props) => {
  /**
   * 获取角色选项
   */
  const roleOptions = useMemo(() => {
    return props.roles.map((role: RoleModel) => ({
      label: role.roleName,
      value: role.roleCode,
    }));
  }, [props.roles]);

  /**
   * 处理角色选择变化
   */
  const handleChange = (value: string | string[]) => {
    if (props.mode === 'single' || props.mode === 'select-with-refresh') {
      if (typeof value === 'string') {
        props.onSelect(value);
      }
    } else if (props.mode === 'multiple') {
      if (Array.isArray(value)) {
        props.onSelect(value);
      }
    }
  };

  // 根据模式渲染不同的组件
  switch (props.mode) {
    case 'single':
      return (
        <BaseRoleSelector
          options={roleOptions}
          loading={props.loading}
          placeholder={props.placeholder}
          width={props.width}
          showSearch={props.showSearch}
          disabled={props.disabled}
          className={props.className}
          value={props.selectedRole}
          onChange={handleChange}
        />
      );

    case 'multiple':
      return (
        <MultipleRoleSelector
          roles={props.roles}
          selectedRoles={props.selectedRoles}
          loading={props.loading}
          placeholder={props.placeholder}
          width={props.width}
          onSelect={props.onSelect}
        />
      );

    case 'select-with-refresh':
      return (
        <RoleSelectorBar
          roles={props.roles}
          selectedRole={props.selectedRole}
          loading={props.loading}
          placeholder={props.placeholder}
          width={props.width}
          showRefreshButton={props.showRefreshButton}
          onSelect={props.onSelect}
          onRefresh={props.onRefresh}
        />
      );

    default:
      return null;
  }
});

UniversalRoleSelector.displayName = 'UniversalRoleSelector';

export default UniversalRoleSelector;
