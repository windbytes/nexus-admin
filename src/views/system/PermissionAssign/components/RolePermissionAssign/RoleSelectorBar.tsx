import { useQuery } from '@tanstack/react-query';
import { Select, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useMemo, memo } from 'react';
import type React from 'react';
import { roleService } from '@/services/system/role/roleApi';
import type { RoleModel } from '@/services/system/role/type';

/**
 * 角色选择栏组件Props
 */
interface RoleSelectorBarProps {
  /** 当前选中的角色Code */
  currentRoleCode: string | null;
  /** 角色选择回调 */
  onRoleChange: (roleCode: string) => void;
  /** 角色选择时加载 */
  loading?: boolean;
}

/**
 * 角色选择栏组件
 * 专门负责角色选择功能
 */
const RoleSelectorBar: React.FC<RoleSelectorBarProps> = memo(({
  currentRoleCode,
  onRoleChange,
  loading = false,
}) => {
  /**
   * 查询角色列表
   */
  const { data: roleListResponse, isLoading: roleListLoading } = useQuery({
    queryKey: ['role-list'],
    queryFn: () => roleService.getRoleList({}),
  });

  /**
   * 获取角色选项
   */
  const roleOptions = useMemo(() => {
    if (!roleListResponse) return [];
    return roleListResponse.map((role: RoleModel) => ({
      label: role.roleName,
      value: role.roleCode,
    }));
  }, [roleListResponse]);

  return (
    <Space>
      <UserOutlined className="text-gray-500" />
      <span className="font-medium">选择角色：</span>
      <Select
        placeholder="请选择要分配权限的角色"
        style={{ width: 300 }}
        value={currentRoleCode}
        onChange={onRoleChange}
        loading={loading || roleListLoading}
        showSearch
        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        options={roleOptions}
      />
    </Space>
  );
});

export default RoleSelectorBar;
