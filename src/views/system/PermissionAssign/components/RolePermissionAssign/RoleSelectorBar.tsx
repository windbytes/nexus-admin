import { useQuery } from '@tanstack/react-query';
import { Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { memo } from 'react';
import type React from 'react';
import { roleService } from '@/services/system/role/roleApi';
import { UniversalRoleSelector } from '@/components/UniversalRoleSelector';

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
 * 使用通用角色选择组件，专门负责角色选择功能
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

  return (
    <Space>
      <UserOutlined className="text-gray-500" />
      <span className="font-medium">选择角色：</span>
      <UniversalRoleSelector
        roles={roleListResponse || []}
        selectedRole={currentRoleCode}
        mode="single"
        onSelect={onRoleChange}
        loading={loading || roleListLoading}
        placeholder="请选择要分配权限的角色"
        width={300}
      />
    </Space>
  );
});

export default RoleSelectorBar;
